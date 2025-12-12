import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from request_server.api.routes.ssh_keys import parse_ssh_key
from request_server.core.security import CurrentUser, get_current_user
from request_server.db.session import get_db
from request_server.models.ssh_key import SSHKey
from request_server.models.vm_request import ProjectType as DBProjectType
from request_server.models.vm_request import VMRequest as VMRequestModel
from request_server.schemas.vm_request import (
    ProjectType,
    VMRequestCreate,
    VMRequestListResponse,
    VMRequestResponse,
)
from request_server.services.jira import jira_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vm-requests", tags=["VM Requests"])


def get_project_details(request: VMRequestCreate) -> dict:
    """Extract project-specific details as a dictionary."""
    if request.project_type == ProjectType.IPRAKTIKUM and request.ipraktikum:
        return request.ipraktikum.model_dump(by_alias=False)
    elif request.project_type == ProjectType.THESIS and request.thesis:
        return request.thesis.model_dump(by_alias=False)
    elif request.project_type == ProjectType.CHAIR_PROJECT and request.chair_project:
        return request.chair_project.model_dump(by_alias=False)
    return {}


@router.post(
    "",
    response_model=VMRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_vm_request(
    request: VMRequestCreate,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VMRequestModel:
    """Create a new VM request."""
    # Handle SSH key - create new key in database if needed
    ssh_key_type = request.ssh_key.type
    ssh_key_value = None
    ssh_public_key = None  # Track the actual public key for Jira ticket

    if ssh_key_type == "new":
        # Parse and validate the SSH key
        try:
            key_type, fingerprint = parse_ssh_key(request.ssh_key.public_key)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid SSH key: {e}",
            ) from e

        ssh_public_key = request.ssh_key.public_key.strip()

        # Check if this key already exists for the user
        existing_query = select(SSHKey).where(
            SSHKey.owner_id == current_user.id,
            SSHKey.fingerprint == fingerprint,
        )
        existing = await db.execute(existing_query)
        existing_key = existing.scalar_one_or_none()

        if existing_key:
            # Key already exists, use its ID
            ssh_key_value = str(existing_key.id)
        else:
            # Create new SSH key
            new_ssh_key = SSHKey(
                owner_id=current_user.id,
                owner_username=current_user.username,
                name=request.ssh_key.name,
                public_key=ssh_public_key,
                fingerprint=fingerprint,
                key_type=key_type,
            )
            db.add(new_ssh_key)
            await db.flush()
            ssh_key_value = str(new_ssh_key.id)

    elif ssh_key_type == "existing":
        # Verify the key exists and belongs to the user
        key_query = select(SSHKey).where(
            SSHKey.id == uuid.UUID(request.ssh_key.key_id),
            SSHKey.owner_id == current_user.id,
        )
        result = await db.execute(key_query)
        existing_key = result.scalar_one_or_none()

        if not existing_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected SSH key not found or does not belong to you",
            )

        ssh_key_value = request.ssh_key.key_id
        ssh_public_key = existing_key.public_key

    # Create the VM request
    vm_request = VMRequestModel(
        requester_id=current_user.id,
        requester_username=current_user.username,
        requester_name=current_user.full_name,
        requester_email=current_user.email,
        hostname=request.hostname,
        description=request.description,
        project_type=DBProjectType(request.project_type.value),
        project_details=get_project_details(request),
        cpu_cores=request.resources.cpu_cores,
        ram_gb=request.resources.ram_gb,
        resource_justification=request.resources.justification,
        default_ports_enabled=request.firewall.default_ports,
        additional_ports=[port.model_dump() for port in request.firewall.additional_ports],
        additional_users=request.additional_users,
        ssh_key_type=ssh_key_type,
        ssh_key_value=ssh_key_value,
        additional_comments=request.additional_comments,
    )

    db.add(vm_request)
    await db.commit()
    await db.refresh(vm_request)

    # Create Jira ticket synchronously so we can return the ticket key
    try:
        ticket_key = await jira_service.create_ticket(vm_request, ssh_public_key)
        if ticket_key:
            vm_request.jira_ticket_key = ticket_key
            await db.commit()
            await db.refresh(vm_request)
            logger.info(f"Created Jira ticket {ticket_key} for VM request {vm_request.id}")
        else:
            logger.warning(f"Failed to create Jira ticket for VM request {vm_request.id}")
    except Exception as e:
        logger.error(f"Error creating Jira ticket for VM request {vm_request.id}: {e}")
        # Don't fail the request if Jira ticket creation fails

    return vm_request


@router.get("", response_model=list[VMRequestListResponse])
async def list_vm_requests(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[VMRequestModel]:
    """List VM requests. Admins see all requests, regular users see only their own."""
    if current_user.is_admin:
        query = select(VMRequestModel).order_by(VMRequestModel.created_at.desc())
    else:
        query = (
            select(VMRequestModel)
            .where(VMRequestModel.requester_id == current_user.id)
            .order_by(VMRequestModel.created_at.desc())
        )
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{request_id}", response_model=VMRequestResponse)
async def get_vm_request(
    request_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VMRequestModel:
    """Get a specific VM request."""
    query = select(VMRequestModel).where(VMRequestModel.id == request_id)
    result = await db.execute(query)
    vm_request = result.scalar_one_or_none()

    if not vm_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VM request not found",
        )

    # Check if user is authorized to view this request
    if vm_request.requester_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this request",
        )

    return vm_request

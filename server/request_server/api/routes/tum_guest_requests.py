"""TUM Guest Account Request API routes."""

import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from request_server.core.config import settings
from request_server.core.security import CurrentUser, get_current_user, get_optional_current_user
from request_server.db.session import get_db
from request_server.models.tum_guest_request import Gender as GenderModel
from request_server.models.tum_guest_request import GuestType as GuestTypeModel
from request_server.models.tum_guest_request import TUMGuestRequest as TUMGuestRequestModel
from request_server.schemas.tum_guest_request import (
    ArtemisDetails,
    GuestType,
    IPraktikumDetails,
    OtherDetails,
    TUMGuestRequestCreateAnonymous,
    TUMGuestRequestCreateAuthenticated,
    TUMGuestRequestListResponse,
    TUMGuestRequestResponse,
)
from request_server.services.descriptions.tum_guest_request import (
    handle_tum_guest_ticket_creation,
)
from request_server.services.ticket import get_ticket_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tum-guest-requests", tags=["TUM Guest Requests"])


def _extract_guest_type_details(
    guest_type: GuestType,
    ipraktikum_fields: IPraktikumDetails | None,
    artemis_fields: ArtemisDetails | None,
    other_fields: OtherDetails | None,
) -> dict:
    """Extract guest type specific details based on guest type."""
    if guest_type == GuestType.IPRAKTIKUM_CUSTOMER and ipraktikum_fields:
        return {
            "team_name": ipraktikum_fields.team_name,
            "coach_name": ipraktikum_fields.coach_name,
        }
    elif guest_type == GuestType.ARTEMIS and artemis_fields:
        return {"university_or_company": artemis_fields.university_or_company}
    elif guest_type == GuestType.OTHER and other_fields:
        return {"reason": other_fields.reason}
    return {}


@router.post(
    "",
    response_model=TUMGuestRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_tum_guest_request(
    request: TUMGuestRequestCreateAnonymous | TUMGuestRequestCreateAuthenticated,
    current_user: Annotated[CurrentUser | None, Depends(get_optional_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TUMGuestRequestModel:
    """
    Create a new TUM Guest Account request.

    This endpoint supports both authenticated and anonymous requests:
    - Authenticated users: Request guest accounts for others (they already have a TUM account)
    - Anonymous users: Request guest accounts for themselves or others
    """
    is_authenticated = current_user is not None

    # Extract guest type details
    guest_type_details = _extract_guest_type_details(
        request.guest_type,
        getattr(request, "ipraktikum_fields", None),
        getattr(request, "artemis_fields", None),
        getattr(request, "other_fields", None),
    )

    # Create the TUM guest request
    guest_request = TUMGuestRequestModel(
        # Requester info (if authenticated)
        requester_id=current_user.id if current_user else None,
        requester_username=current_user.username if current_user else None,
        requester_name=current_user.full_name if current_user else None,
        requester_email=current_user.email if current_user else None,
        # Authentication flags
        is_authenticated_request=is_authenticated,
        requesting_for_self=(
            getattr(request, "requesting_for_self", False) if not is_authenticated else False
        ),
        # Guest info
        guest_first_name=request.first_name,
        guest_last_name=request.last_name,
        guest_email=request.email,
        guest_birth_date=request.birth_date,
        guest_gender=GenderModel(request.gender.value),
        guest_nationality=request.nationality,
        # Contact person (required for anonymous, optional for authenticated)
        contact_person=getattr(request, "contact_person", None),
        # Guest type
        guest_type=GuestTypeModel(request.guest_type.value),
        guest_type_details=guest_type_details,
        # Additional info
        additional_comments=request.additional_comments,
    )

    db.add(guest_request)
    await db.commit()
    await db.refresh(guest_request)

    # Create ticket in the configured ticket system
    try:
        ticket_key = await handle_tum_guest_ticket_creation(
            get_ticket_service(),
            guest_request,
            is_authenticated=is_authenticated,
            requester_username=current_user.username if current_user else None,
        )
        if ticket_key:
            guest_request.jira_ticket_key = ticket_key
            await db.commit()
            await db.refresh(guest_request)
            logger.info(f"Created ticket {ticket_key} for TUM guest request {guest_request.id}")
        elif settings.ticket_system != "debug":
            logger.warning(f"Failed to create ticket for TUM guest request {guest_request.id}")
    except Exception as e:
        logger.error(f"Error creating ticket for TUM guest request {guest_request.id}: {e}")
        # Don't fail the request if ticket creation fails

    return guest_request


@router.get("", response_model=list[TUMGuestRequestListResponse])
async def list_tum_guest_requests(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[TUMGuestRequestModel]:
    """
    List all TUM guest requests for the current user.

    Only returns requests created by the authenticated user.
    Admin users can see all requests.
    """
    if current_user.is_admin:
        query = select(TUMGuestRequestModel).order_by(TUMGuestRequestModel.created_at.desc())
    else:
        query = (
            select(TUMGuestRequestModel)
            .where(TUMGuestRequestModel.requester_id == current_user.id)
            .order_by(TUMGuestRequestModel.created_at.desc())
        )
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{request_id}", response_model=TUMGuestRequestResponse)
async def get_tum_guest_request(
    request_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TUMGuestRequestModel:
    """Get a specific TUM guest request."""
    query = select(TUMGuestRequestModel).where(TUMGuestRequestModel.id == request_id)
    result = await db.execute(query)
    guest_request = result.scalar_one_or_none()

    if not guest_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="TUM guest request not found",
        )

    # Check if user is authorized to view this request
    if guest_request.requester_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this request",
        )

    return guest_request

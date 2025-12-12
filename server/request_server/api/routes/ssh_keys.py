"""SSH Key API routes."""

import hashlib
import re
import uuid
from base64 import b64decode
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from request_server.core.security import CurrentUser, get_current_user
from request_server.db.session import get_db
from request_server.models.ssh_key import SSHKey, SSHKeyType
from request_server.schemas.ssh_key import SSHKeyCreate, SSHKeyResponse

router = APIRouter(prefix="/ssh-keys", tags=["SSH Keys"])


def parse_ssh_key(public_key: str) -> tuple[SSHKeyType, str]:
    """
    Parse an SSH public key and return its type and fingerprint.

    Returns:
        Tuple of (key_type, fingerprint)

    Raises:
        ValueError if the key is invalid
    """
    public_key = public_key.strip()

    # Match SSH key format: type base64-data [comment]
    match = re.match(r"^(ssh-rsa|ssh-ed25519|ecdsa-sha2-\S+)\s+(\S+)", public_key)
    if not match:
        raise ValueError("Invalid SSH key format")

    key_type_str = match.group(1)
    key_data = match.group(2)

    # Determine key type
    if key_type_str == "ssh-rsa":
        key_type = SSHKeyType.RSA
    elif key_type_str == "ssh-ed25519":
        key_type = SSHKeyType.ED25519
    elif key_type_str.startswith("ecdsa-"):
        key_type = SSHKeyType.ECDSA
    else:
        raise ValueError(f"Unsupported key type: {key_type_str}")

    # Validate and decode base64
    try:
        decoded = b64decode(key_data)
    except Exception as e:
        raise ValueError(f"Invalid base64 in SSH key: {e}") from e

    # Calculate SHA256 fingerprint
    sha256_hash = hashlib.sha256(decoded).digest()
    # Encode as base64 and format like OpenSSH
    import base64

    fingerprint = base64.b64encode(sha256_hash).decode().rstrip("=")
    fingerprint = f"SHA256:{fingerprint}"

    return key_type, fingerprint


@router.get("", response_model=list[SSHKeyResponse])
async def list_ssh_keys(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[SSHKey]:
    """List all SSH keys for the current user."""
    query = (
        select(SSHKey).where(SSHKey.owner_id == current_user.id).order_by(SSHKey.created_at.desc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("", response_model=SSHKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_ssh_key(
    key_data: SSHKeyCreate,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SSHKey:
    """Create a new SSH key for the current user."""
    # Parse and validate the SSH key
    try:
        key_type, fingerprint = parse_ssh_key(key_data.public_key)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    # Check if key with same fingerprint already exists for this user
    existing_query = select(SSHKey).where(
        SSHKey.owner_id == current_user.id,
        SSHKey.fingerprint == fingerprint,
    )
    existing = await db.execute(existing_query)
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This SSH key is already registered",
        )

    # Create the SSH key
    ssh_key = SSHKey(
        owner_id=current_user.id,
        owner_username=current_user.username,
        name=key_data.name,
        public_key=key_data.public_key.strip(),
        fingerprint=fingerprint,
        key_type=key_type,
    )

    db.add(ssh_key)
    await db.commit()
    await db.refresh(ssh_key)

    return ssh_key


@router.get("/{key_id}", response_model=SSHKeyResponse)
async def get_ssh_key(
    key_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SSHKey:
    """Get a specific SSH key."""
    query = select(SSHKey).where(SSHKey.id == key_id)
    result = await db.execute(query)
    ssh_key = result.scalar_one_or_none()

    if not ssh_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SSH key not found",
        )

    # Check ownership
    if ssh_key.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this SSH key",
        )

    return ssh_key


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ssh_key(
    key_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete an SSH key."""
    query = select(SSHKey).where(SSHKey.id == key_id)
    result = await db.execute(query)
    ssh_key = result.scalar_one_or_none()

    if not ssh_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SSH key not found",
        )

    # Check ownership
    if ssh_key.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this SSH key",
        )

    await db.delete(ssh_key)
    await db.commit()

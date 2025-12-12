"""SSH Key schemas."""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class SSHKeyType(str, Enum):
    RSA = "rsa"
    ED25519 = "ed25519"
    ECDSA = "ecdsa"


class SSHKeyCreate(BaseModel):
    """Schema for creating a new SSH key."""

    name: str = Field(..., min_length=1, max_length=255)
    public_key: str = Field(..., min_length=1, alias="publicKey")

    model_config = ConfigDict(populate_by_name=True)


class SSHKeyResponse(BaseModel):
    """Schema for SSH key response."""

    id: uuid.UUID
    name: str
    fingerprint: str
    key_type: SSHKeyType = Field(alias="type")
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

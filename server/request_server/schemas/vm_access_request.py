"""VM Access Request schemas."""

import re
import uuid
from datetime import datetime
from enum import Enum
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from request_server.core.config import settings


class AccessRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


# SSH Key configuration (same as VM request)
class SSHKeyExisting(BaseModel):
    type: Literal["existing"]
    key_id: str = Field(..., min_length=1, alias="keyId")

    model_config = ConfigDict(populate_by_name=True)


class SSHKeyNew(BaseModel):
    type: Literal["new"]
    name: str = Field(..., min_length=1, max_length=255)
    public_key: str = Field(..., min_length=1, alias="publicKey")

    model_config = ConfigDict(populate_by_name=True)


SSHKey = Annotated[SSHKeyExisting | SSHKeyNew, Field(discriminator="type")]


class VMAccessRequestCreate(BaseModel):
    """Schema for creating a new VM access request."""

    hostname: str = Field(..., min_length=1, max_length=63)
    justification: str = Field(..., min_length=10)
    contact_person: str | None = Field(None, alias="contactPerson")
    ssh_key: SSHKey = Field(..., alias="sshKey")

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("hostname")
    @classmethod
    def validate_hostname(cls, v: str) -> str:
        pattern = r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$"
        if not re.match(pattern, v):
            raise ValueError(
                "Hostname must be lowercase alphanumeric with hyphens, no leading/trailing hyphens"
            )
        return v


class VMAccessRequestResponse(BaseModel):
    """Schema for VM access request response."""

    id: uuid.UUID
    hostname: str
    justification: str
    contact_person: str | None
    ssh_key_type: str
    status: AccessRequestStatus
    requester_username: str
    jira_ticket_key: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def jira_ticket_url(self) -> str | None:
        """Return the full URL to the Jira ticket."""
        if self.jira_ticket_key and settings.jira_url:
            return f"{settings.jira_url.rstrip('/')}/browse/{self.jira_ticket_key}"
        return None


class VMAccessRequestListResponse(BaseModel):
    """Schema for VM access request list response."""

    id: uuid.UUID
    hostname: str
    status: AccessRequestStatus
    requester_username: str
    jira_ticket_key: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def jira_ticket_url(self) -> str | None:
        """Return the full URL to the Jira ticket."""
        if self.jira_ticket_key and settings.jira_url:
            return f"{settings.jira_url.rstrip('/')}/browse/{self.jira_ticket_key}"
        return None

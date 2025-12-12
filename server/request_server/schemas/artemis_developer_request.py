"""Artemis Developer Access Request schemas."""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field, field_validator

from request_server.core.config import settings


class ArtemisRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


# Valid subteam options
VALID_SUBTEAMS = [
    "apollon",
    "ares",
    "athena",
    "atlas",
    "communication",
    "hephaestus",
    "hyperion",
    "iris",
    "lectures",
    "logos",
    "lti",
    "mobile-apps",
    "operations",
    "plagiarism",
    "programming",
    "quiz",
    "other",
]


class GitHubInfo(BaseModel):
    """GitHub user info from verification."""

    login: str
    id: int
    avatar_url: str = Field(..., alias="avatarUrl")
    html_url: str = Field(..., alias="htmlUrl")
    name: str | None = None

    model_config = ConfigDict(populate_by_name=True)


# Request schemas for logged-in users
class ArtemisDeveloperRequestCreateAuthenticated(BaseModel):
    """Schema for logged-in users creating an Artemis developer request."""

    github_username: str = Field(..., min_length=1, max_length=39, alias="githubUsername")
    github_info: GitHubInfo | None = Field(None, alias="githubInfo")

    slack_email: EmailStr = Field(..., alias="slackEmail")
    contact_person: str = Field(..., min_length=1, alias="contactPerson")
    advisor: str = Field(..., min_length=1)

    subteams: list[str] = Field(..., min_length=1)
    other_subteam: str | None = Field(None, alias="otherSubteam")

    additional_comments: str | None = Field(None, alias="additionalComments")

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("github_username")
    @classmethod
    def validate_github_username(cls, v: str) -> str:
        import re

        if not re.match(r"^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$", v):
            raise ValueError("Invalid GitHub username format")
        return v

    @field_validator("subteams")
    @classmethod
    def validate_subteams(cls, v: list[str]) -> list[str]:
        for subteam in v:
            if subteam not in VALID_SUBTEAMS:
                raise ValueError(f"Invalid subteam: {subteam}")
        return v


# Request schema for anonymous users
class ArtemisDeveloperRequestCreateAnonymous(BaseModel):
    """Schema for anonymous users creating an Artemis developer request."""

    name: str = Field(..., min_length=1)
    main_email: EmailStr = Field(..., alias="mainEmail")

    github_username: str = Field(..., min_length=1, max_length=39, alias="githubUsername")
    github_info: GitHubInfo | None = Field(None, alias="githubInfo")

    slack_email: EmailStr = Field(..., alias="slackEmail")
    contact_person: str = Field(..., min_length=1, alias="contactPerson")
    advisor: str = Field(..., min_length=1)

    subteams: list[str] = Field(..., min_length=1)
    other_subteam: str | None = Field(None, alias="otherSubteam")

    additional_comments: str | None = Field(None, alias="additionalComments")

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("github_username")
    @classmethod
    def validate_github_username(cls, v: str) -> str:
        import re

        if not re.match(r"^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$", v):
            raise ValueError("Invalid GitHub username format")
        return v

    @field_validator("subteams")
    @classmethod
    def validate_subteams(cls, v: list[str]) -> list[str]:
        for subteam in v:
            if subteam not in VALID_SUBTEAMS:
                raise ValueError(f"Invalid subteam: {subteam}")
        return v


class ArtemisDeveloperRequestResponse(BaseModel):
    """Schema for Artemis developer request response."""

    id: uuid.UUID
    is_authenticated_request: bool

    # Requester info
    requester_username: str | None
    requester_name: str | None
    requester_email: str | None

    # Anonymous user info
    anonymous_name: str | None
    anonymous_email: str | None

    # GitHub info
    github_username: str
    github_user_id: int | None
    github_avatar_url: str | None
    github_profile_url: str | None
    github_name: str | None
    github_verified: bool

    # Artemis details
    slack_email: str
    contact_person: str
    advisor: str
    subteams: list[str]
    other_subteam: str | None

    # Additional info
    additional_comments: str | None

    # Status
    status: ArtemisRequestStatus

    # Jira
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


class ArtemisDeveloperRequestListResponse(BaseModel):
    """Schema for Artemis developer request list response."""

    id: uuid.UUID
    is_authenticated_request: bool
    requester_username: str | None
    anonymous_name: str | None
    github_username: str
    github_avatar_url: str | None
    slack_email: str
    subteams: list[str]
    status: ArtemisRequestStatus
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

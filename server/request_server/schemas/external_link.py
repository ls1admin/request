"""External Link and Section schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

# --- Link schemas ---


def _validate_url(value: str) -> str:
    """Validate that a string is a valid HTTP(S) URL."""
    from urllib.parse import urlparse

    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("Must be a valid HTTP or HTTPS URL")
    return value


class ExternalLinkCreate(BaseModel):
    """Schema for creating a new external link."""

    label: str = Field(..., min_length=1, max_length=255)
    url: str = Field(..., min_length=1, max_length=2048)
    image_url: str | None = Field(None, max_length=2048, alias="imageUrl")
    description: str | None = Field(None, max_length=500)
    enabled: bool = True
    display_order: int = Field(0, alias="displayOrder")

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        return _validate_url(v)

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: str | None) -> str | None:
        if v is not None:
            return _validate_url(v)
        return v


class ExternalLinkUpdate(BaseModel):
    """Schema for updating an external link."""

    label: str | None = Field(None, min_length=1, max_length=255)
    url: str | None = Field(None, min_length=1, max_length=2048)
    image_url: str | None = Field(None, max_length=2048, alias="imageUrl")
    description: str | None = None
    enabled: bool | None = None
    display_order: int | None = Field(None, alias="displayOrder")

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str | None) -> str | None:
        if v is not None:
            return _validate_url(v)
        return v

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: str | None) -> str | None:
        if v is not None:
            return _validate_url(v)
        return v


class ExternalLinkResponse(BaseModel):
    """Schema for external link response."""

    id: uuid.UUID
    label: str
    url: str
    image_url: str | None = Field(alias="imageUrl")
    description: str | None
    enabled: bool
    display_order: int = Field(alias="displayOrder")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# --- Section schemas ---


class ExternalLinkSectionCreate(BaseModel):
    """Schema for creating a new section."""

    title: str = Field(..., min_length=1, max_length=255)
    icon: str | None = Field(None, max_length=100)
    display_order: int = Field(0, alias="displayOrder")

    model_config = ConfigDict(populate_by_name=True)


class ExternalLinkSectionUpdate(BaseModel):
    """Schema for updating a section."""

    title: str | None = Field(None, min_length=1, max_length=255)
    icon: str | None = None
    display_order: int | None = Field(None, alias="displayOrder")

    model_config = ConfigDict(populate_by_name=True)


class ExternalLinkSectionResponse(BaseModel):
    """Schema for section response with nested links."""

    id: uuid.UUID
    title: str
    icon: str | None
    display_order: int = Field(alias="displayOrder")
    links: list[ExternalLinkResponse]
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# --- Reorder / Move schemas ---


class SectionOrderItem(BaseModel):
    """Single section ordering entry."""

    id: uuid.UUID
    display_order: int = Field(alias="displayOrder")

    model_config = ConfigDict(populate_by_name=True)


class LinkOrderItem(BaseModel):
    """Single link ordering entry (supports cross-section moves)."""

    id: uuid.UUID
    section_id: uuid.UUID = Field(alias="sectionId")
    display_order: int = Field(alias="displayOrder")

    model_config = ConfigDict(populate_by_name=True)


class ReorderRequest(BaseModel):
    """Bulk reorder request for sections and/or links."""

    sections: list[SectionOrderItem] | None = None
    links: list[LinkOrderItem] | None = None


class MoveRequest(BaseModel):
    """Move a link to a different section."""

    section_id: uuid.UUID = Field(alias="sectionId")
    display_order: int = Field(0, alias="displayOrder")

    model_config = ConfigDict(populate_by_name=True)

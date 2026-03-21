"""External Link and Section database models."""

import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from request_server.db.base import Base, TimestampMixin


class ExternalLinkSection(Base, TimestampMixin):
    """Section for grouping external links."""

    __tablename__ = "external_link_sections"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    links: Mapped[list["ExternalLink"]] = relationship(
        "ExternalLink",
        back_populates="section",
        cascade="all, delete-orphan",
        order_by="ExternalLink.display_order",
    )


class ExternalLink(Base, TimestampMixin):
    """External link within a section."""

    __tablename__ = "external_links"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("external_link_sections.id"),
        nullable=False,
        index=True,
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    section: Mapped["ExternalLinkSection"] = relationship(
        "ExternalLinkSection",
        back_populates="links",
    )

"""SSH Key database model."""

import uuid
from enum import Enum

from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from request_server.db.base import Base, TimestampMixin


class SSHKeyType(str, Enum):
    RSA = "rsa"
    ED25519 = "ed25519"
    ECDSA = "ecdsa"


class SSHKey(Base, TimestampMixin):
    """SSH Key model for storing user's public keys."""

    __tablename__ = "ssh_keys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Owner info (from Keycloak token)
    owner_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    owner_username: Mapped[str] = mapped_column(String(255), nullable=False)

    # Key details
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    public_key: Mapped[str] = mapped_column(Text, nullable=False)
    fingerprint: Mapped[str] = mapped_column(String(255), nullable=False)
    key_type: Mapped[SSHKeyType] = mapped_column(String(20), nullable=False)

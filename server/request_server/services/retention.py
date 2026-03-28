"""Data retention service.

Deletes request records older than the configured retention period.
SSH keys and external links are exempt (account/config data).
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete

from request_server.core.config import settings
from request_server.db.session import async_session_maker
from request_server.models import (
    ArtemisDeveloperRequest,
    SupportRequest,
    TUMGuestRequest,
    VMAccessRequest,
    VMRequest,
)

logger = logging.getLogger(__name__)

REQUEST_MODELS = [
    VMRequest,
    VMAccessRequest,
    ArtemisDeveloperRequest,
    TUMGuestRequest,
    SupportRequest,
]


async def cleanup_expired_requests() -> int:
    """Delete request records older than retention_days.

    Returns the total number of deleted rows.
    """
    if settings.retention_days <= 0:
        logger.info("Data retention disabled (RETENTION_DAYS=%d)", settings.retention_days)
        return 0

    cutoff = datetime.now(UTC) - timedelta(days=settings.retention_days)
    total_deleted = 0

    async with async_session_maker() as session:
        for model in REQUEST_MODELS:
            result = await session.execute(
                delete(model).where(model.created_at < cutoff)
            )
            count = getattr(result, "rowcount", 0)
            if count > 0:
                logger.info("Deleted %d expired rows from %s", count, model.__tablename__)
            total_deleted += count

        await session.commit()

    logger.info(
        "Retention cleanup complete: %d total rows deleted (cutoff: %s)",
        total_deleted,
        cutoff.isoformat(),
    )
    return total_deleted

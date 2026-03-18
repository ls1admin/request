"""No-op ticket service for when ticket integration is disabled."""

from __future__ import annotations

import logging
from typing import Any

from request_server.services.ticket.base import (
    CommentRequest,
    TicketCreateRequest,
    TicketService,
)

logger = logging.getLogger(__name__)


class NoOpTicketService(TicketService):
    """Ticket service that does nothing. Used when no ticket system is configured."""

    async def create_ticket(self, request: TicketCreateRequest) -> str | None:
        logger.warning(
            "Ticket system is not configured, skipping ticket creation for: %s",
            request.summary,
        )
        return None

    async def add_comment(self, request: CommentRequest) -> bool:
        logger.warning(
            "Ticket system is not configured, skipping comment for ticket: %s",
            request.ticket_key,
        )
        return True

    async def set_custom_field(self, ticket_key: str, field_name: str, value: Any) -> bool:
        logger.warning(
            "Ticket system is not configured, skipping field %s update (%s) for ticket: %s",
            field_name,
            value,
            ticket_key,
        )
        return True

    async def update_status(self, ticket_key: str, status: str) -> bool:
        logger.warning(
            "Ticket system is not configured, skipping status update to '%s' for ticket: %s",
            status,
            ticket_key,
        )
        return True

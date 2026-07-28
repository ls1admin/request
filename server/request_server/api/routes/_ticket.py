"""Shared helpers for handling ticket creation across request routes."""

from __future__ import annotations

import logging
from collections.abc import Awaitable
from typing import Any

from fastapi import HTTPException, status

from request_server.core.config import settings

_TICKET_FAILURE_DETAIL = (
    "The request could not be forwarded to our ticket system. Please try again later."
)


async def raise_on_ticket_failure(
    ticket_task: Awaitable[str | None],
    *,
    entity_id: Any,
    entity_label: str,
    logger: logging.Logger,
) -> str | None:
    """Await a ticket-creation coroutine and raise HTTPException on failure.

    Returns the ticket key on success, or None when the configured ticket
    system deliberately produces no ticket (e.g. NoOp). Callers should defer
    committing the request row until after this returns so an exception
    triggers a rollback of the pending INSERT.
    """
    try:
        ticket_key = await ticket_task
    except Exception as exc:
        logger.exception("Error creating ticket for %s %s", entity_label, entity_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=_TICKET_FAILURE_DETAIL,
        ) from exc

    if ticket_key:
        logger.info("Created ticket %s for %s %s", ticket_key, entity_label, entity_id)
        return ticket_key

    if settings.ticket_system_enabled:
        logger.error("Ticket service returned no key for %s %s", entity_label, entity_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=_TICKET_FAILURE_DETAIL,
        )

    return None

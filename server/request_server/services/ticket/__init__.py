"""Ticket service factory.

Provides get_ticket_service() to obtain the configured ticket system implementation.
"""

from __future__ import annotations

import logging

from request_server.core.config import settings
from request_server.services.ticket.base import TicketService
from request_server.services.ticket.noop import NoOpTicketService

logger = logging.getLogger(__name__)

_ticket_service: TicketService | None = None


def get_ticket_service() -> TicketService:
    """Get the configured ticket service instance (singleton).

    Returns NoOpTicketService if the configured system is not available.
    """
    global _ticket_service

    if _ticket_service is not None:
        return _ticket_service

    ticket_system = settings.ticket_system

    if ticket_system == "jira" and settings.jira_enabled:
        from request_server.services.ticket.jira import JiraTicketService

        _ticket_service = JiraTicketService()
        logger.info("Initialized Jira ticket service")
    elif ticket_system == "redmine" and settings.redmine_enabled:
        from request_server.services.ticket.redmine import RedmineTicketService

        _ticket_service = RedmineTicketService()
        logger.info("Initialized Redmine ticket service")
    elif ticket_system == "noop" or not settings.ticket_system_enabled:
        _ticket_service = NoOpTicketService()
        logger.info("Initialized NoOp ticket service (ticket system disabled)")
    else:
        logger.warning(
            "Unknown or unconfigured ticket system '%s', falling back to NoOp",
            ticket_system,
        )
        _ticket_service = NoOpTicketService()

    return _ticket_service


def reset_ticket_service() -> None:
    """Reset the singleton (useful for testing)."""
    global _ticket_service
    _ticket_service = None

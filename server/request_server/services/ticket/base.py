"""Abstract ticket service interface.

Defines the contract that all ticket system implementations must follow.
This allows the application to be ticket-system-agnostic.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class TicketCreateRequest:
    """Ticket-system-agnostic request to create a ticket.

    Descriptions are in Markdown format. The ticket service adapter
    converts to the target system's native format before sending.
    """

    summary: str
    description: str
    reporter_username: str | None = None
    reporter_name: str | None = None
    reporter_email: str | None = None
    issue_type: str = "Task"


@dataclass
class CommentRequest:
    """Ticket-system-agnostic request to add a comment.

    Body is in Markdown format.
    """

    ticket_key: str
    body: str


class TicketService(ABC):
    """Abstract interface for any ticket/issue tracking system."""

    @abstractmethod
    async def create_ticket(self, request: TicketCreateRequest) -> str | None:
        """Create a ticket.

        Returns the ticket key/identifier (e.g., "RA2T-123") or None on failure.
        """
        ...

    @abstractmethod
    async def add_comment(self, request: CommentRequest) -> bool:
        """Add a comment to an existing ticket."""
        ...

    @abstractmethod
    async def set_custom_field(
        self, ticket_key: str, field_name: str, value: Any
    ) -> bool:
        """Set a custom field on a ticket.

        This is a generic escape hatch for system-specific fields
        (e.g., Jira's customfield_12200 for secondary reporter).
        """
        ...

    @abstractmethod
    async def update_status(self, ticket_key: str, status: str) -> bool:
        """Update ticket status/transition."""
        ...

"""Debug ticket service for E2E testing.

Captures ticket data to files and prints summary/description markdown
so that tests can verify the full pipeline works correctly.
"""

from __future__ import annotations

import json
import logging
import shutil
from pathlib import Path
from typing import Any

from request_server.services.ticket.base import (
    CommentRequest,
    TicketCreateRequest,
    TicketService,
)

logger = logging.getLogger(__name__)

DEFAULT_OUTPUT_DIR = "/tmp/aet-debug-tickets"


class DebugTicketService(TicketService):
    """Ticket service that captures and prints ticket data for E2E test verification."""

    def __init__(self, output_dir: str = DEFAULT_OUTPUT_DIR) -> None:
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._counter = 0

    async def create_ticket(self, request: TicketCreateRequest) -> str | None:
        self._counter += 1
        ticket_key = f"DEBUG-{self._counter}"

        logger.info("Creating debug ticket %s: %s", ticket_key, request.summary)
        print(f"\n{'=' * 60}")
        print(f"TICKET CREATED: {ticket_key}")
        print(f"SUMMARY: {request.summary}")
        print(f"DESCRIPTION:\n{request.description}")
        print(f"{'=' * 60}\n")

        output = {
            "ticket_key": ticket_key,
            "summary": request.summary,
            "description": request.description,
            "reporter_username": request.reporter_username,
            "reporter_name": request.reporter_name,
            "reporter_email": request.reporter_email,
            "issue_type": request.issue_type,
            "comments": [],
            "custom_fields": [],
        }
        (self.output_dir / f"{ticket_key}.json").write_text(
            json.dumps(output, indent=2, default=str)
        )

        return ticket_key

    async def add_comment(self, request: CommentRequest) -> bool:
        ticket_file = self.output_dir / f"{request.ticket_key}.json"
        if ticket_file.exists():
            data = json.loads(ticket_file.read_text())
            data["comments"].append(request.body)
            ticket_file.write_text(json.dumps(data, indent=2, default=str))

        logger.info("Adding comment to debug ticket %s", request.ticket_key)
        print(f"\nCOMMENT on {request.ticket_key}:\n{request.body}\n")
        return True

    async def set_custom_field(self, ticket_key: str, field_name: str, value: Any) -> bool:
        ticket_file = self.output_dir / f"{ticket_key}.json"
        if ticket_file.exists():
            data = json.loads(ticket_file.read_text())
            data["custom_fields"].append({"field": field_name, "value": value})
            ticket_file.write_text(json.dumps(data, indent=2, default=str))

        logger.info("Setting field %s on debug ticket %s", field_name, ticket_key)
        return True

    async def update_status(self, ticket_key: str, status: str) -> bool:
        logger.info("Updating status of debug ticket %s to %s", ticket_key, status)
        return True

    def clear_all(self) -> None:
        """Remove all captured tickets. Used between tests."""
        if self.output_dir.exists():
            shutil.rmtree(self.output_dir)
            self.output_dir.mkdir(parents=True, exist_ok=True)
        self._counter = 0

    def get_all_tickets(self) -> list[dict]:
        """Return all captured tickets sorted by creation order."""
        tickets = []
        for path in sorted(self.output_dir.glob("DEBUG-*.json")):
            tickets.append(json.loads(path.read_text()))
        return tickets

    def get_latest_ticket(self) -> dict | None:
        """Return the most recently created ticket."""
        files = sorted(self.output_dir.glob("DEBUG-*.json"))
        if not files:
            return None
        return json.loads(files[-1].read_text())

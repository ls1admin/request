"""Jira ticket service implementation.

Handles HTTP transport to the Jira REST API. Description and comment
content arrives in Markdown and is converted to Jira wiki markup
via JiraMarkupFormatter before sending.
"""

from __future__ import annotations

import logging
from base64 import b64encode
from typing import Any

import httpx

from request_server.core.config import settings
from request_server.services.descriptions.formatters import JiraMarkupFormatter
from request_server.services.ticket.base import (
    CommentRequest,
    TicketCreateRequest,
    TicketService,
)

logger = logging.getLogger(__name__)


class JiraTicketService(TicketService):
    """Ticket service backed by Jira REST API v2."""

    def __init__(self) -> None:
        self.base_url = settings.jira_url.rstrip("/")
        self.project_key = settings.jira_project
        self._auth_header = self._create_auth_header()
        self._formatter = JiraMarkupFormatter()

    def _create_auth_header(self) -> str:
        credentials = f"{settings.jira_username}:{settings.jira_api_token}"
        encoded = b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"

    def _get_headers(self) -> dict[str, str]:
        return {
            "Authorization": self._auth_header,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def create_ticket(self, request: TicketCreateRequest) -> str | None:
        issue_data: dict[str, Any] = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": request.summary,
                "description": self._formatter.convert(request.description),
                "issuetype": {"name": request.issue_type},
            }
        }

        if request.reporter_username:
            issue_data["fields"]["reporter"] = {"name": request.reporter_username}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/rest/api/2/issue",
                    json=issue_data,
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                result = response.json()
                ticket_key = result.get("key")
                logger.info("Created Jira ticket %s", ticket_key)
                return ticket_key
            except httpx.HTTPStatusError as e:
                logger.error(
                    "Failed to create Jira ticket: %s - %s",
                    e.response.status_code,
                    e.response.text,
                )
                return None
            except httpx.HTTPError as e:
                logger.error("Failed to create Jira ticket: %s", e)
                return None

    async def add_comment(self, request: CommentRequest) -> bool:
        comment_body = self._formatter.convert(request.body)

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/rest/api/2/issue/{request.ticket_key}/comment",
                    json={"body": comment_body},
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                logger.info("Added comment to ticket %s", request.ticket_key)
                return True
            except httpx.HTTPError as e:
                logger.warning("Failed to add comment to ticket %s: %s", request.ticket_key, e)
                return False

    async def set_custom_field(self, ticket_key: str, field_name: str, value: Any) -> bool:
        update_data = {"fields": {field_name: value}}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.put(
                    f"{self.base_url}/rest/api/2/issue/{ticket_key}",
                    json=update_data,
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                logger.info("Set %s on ticket %s", field_name, ticket_key)
                return True
            except httpx.HTTPError as e:
                logger.warning("Failed to set %s on ticket %s: %s", field_name, ticket_key, e)
                return False

    async def update_status(self, ticket_key: str, status: str) -> bool:
        # Requires knowing Jira workflow transition IDs - placeholder for future
        logger.info("Would update ticket %s to status %s", ticket_key, status)
        return True

"""Redmine ticket service implementation.

Handles HTTP transport to the Redmine REST API. Descriptions and comments
are passed as Markdown (Redmine supports textile/markdown natively).

Before creating a ticket for an authenticated user, the service ensures
the user exists in Redmine and belongs to the configured group.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from request_server.core.config import settings
from request_server.services.ticket.base import (
    CommentRequest,
    TicketCreateRequest,
    TicketService,
)

logger = logging.getLogger(__name__)


class RedmineTicketService(TicketService):
    """Ticket service backed by Redmine REST API."""

    def __init__(self) -> None:
        self.base_url = settings.redmine_url.rstrip("/")
        self.project_id = settings.redmine_project
        self.group_id = settings.redmine_group_id

    def _get_headers(self, switch_user: str | None = None) -> dict[str, str]:
        headers = {
            "X-Redmine-API-Key": settings.redmine_api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if switch_user:
            headers["X-Redmine-Switch-User"] = switch_user
        return headers

    # ── User provisioning ────────────────────────────────────────────

    async def _ensure_user(
        self,
        username: str,
        name: str | None,
        email: str | None,
    ) -> bool:
        """Ensure a user exists in Redmine and belongs to the configured group.

        Returns True if the user exists (or was created), False on failure.
        """
        try:
            async with httpx.AsyncClient() as client:
                # 1. Check if user already exists
                response = await client.get(
                    f"{self.base_url}/users.json",
                    params={"name": username},
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                data = response.json()

                if data.get("total_count", 0) > 0:
                    logger.debug("Redmine user '%s' already exists", username)
                    return True

                # 2. Create user
                if not email:
                    logger.warning(
                        "Cannot create Redmine user '%s': no email provided",
                        username,
                    )
                    return False

                first_name, last_name = self._split_name(name)

                create_response = await client.post(
                    f"{self.base_url}/users.json",
                    json={
                        "user": {
                            "login": username,
                            "firstname": first_name,
                            "lastname": last_name,
                            "mail": email,
                        }
                    },
                    headers=self._get_headers(),
                )
                create_response.raise_for_status()
                new_user = create_response.json()
                user_id = new_user["user"]["id"]
                logger.info("Created Redmine user '%s' (id=%s)", username, user_id)

                # 3. Add user to group
                if self.group_id:
                    group_response = await client.post(
                        f"{self.base_url}/groups/{self.group_id}/users.json",
                        json={"user_id": user_id},
                        headers=self._get_headers(),
                    )
                    group_response.raise_for_status()
                    logger.info(
                        "Added user '%s' to group %s", username, self.group_id
                    )

                return True

        except httpx.HTTPStatusError as e:
            logger.error(
                "Redmine user provisioning failed for '%s': %s - %s",
                username,
                e.response.status_code,
                e.response.text,
            )
            return False
        except httpx.HTTPError as e:
            logger.error(
                "Redmine user provisioning failed for '%s': %s", username, e
            )
            return False

    @staticmethod
    def _split_name(name: str | None) -> tuple[str, str]:
        """Split a full name into first and last name."""
        if not name:
            return ("Unknown", "User")
        parts = name.split(maxsplit=1)
        if len(parts) == 1:
            return (parts[0], "")
        return (parts[0], parts[1])

    # ── TicketService interface ──────────────────────────────────────

    async def create_ticket(self, request: TicketCreateRequest) -> str | None:
        switch_user = None

        if request.reporter_username:
            user_ok = await self._ensure_user(
                request.reporter_username,
                request.reporter_name,
                request.reporter_email,
            )
            if user_ok:
                switch_user = request.reporter_username

        issue_data: dict[str, Any] = {
            "issue": {
                "project_id": self.project_id,
                "subject": request.summary,
                "description": request.description,
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/issues.json",
                    json=issue_data,
                    headers=self._get_headers(switch_user=switch_user),
                )
                response.raise_for_status()
                result = response.json()
                issue_id = str(result["issue"]["id"])
                logger.info("Created Redmine issue #%s", issue_id)
                return issue_id
            except httpx.HTTPStatusError as e:
                logger.error(
                    "Failed to create Redmine issue: %s - %s",
                    e.response.status_code,
                    e.response.text,
                )
                return None
            except httpx.HTTPError as e:
                logger.error("Failed to create Redmine issue: %s", e)
                return None

    async def add_comment(self, request: CommentRequest) -> bool:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.put(
                    f"{self.base_url}/issues/{request.ticket_key}.json",
                    json={"issue": {"notes": request.body}},
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                logger.info("Added comment to Redmine issue #%s", request.ticket_key)
                return True
            except httpx.HTTPError as e:
                logger.warning(
                    "Failed to add comment to Redmine issue #%s: %s",
                    request.ticket_key,
                    e,
                )
                return False

    async def set_custom_field(
        self, ticket_key: str, field_name: str, value: Any
    ) -> bool:
        custom_fields = [{"id": int(field_name), "value": value}]

        async with httpx.AsyncClient() as client:
            try:
                response = await client.put(
                    f"{self.base_url}/issues/{ticket_key}.json",
                    json={"issue": {"custom_fields": custom_fields}},
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                logger.info(
                    "Set custom field %s on Redmine issue #%s",
                    field_name,
                    ticket_key,
                )
                return True
            except httpx.HTTPError as e:
                logger.warning(
                    "Failed to set custom field %s on Redmine issue #%s: %s",
                    field_name,
                    ticket_key,
                    e,
                )
                return False

    async def update_status(self, ticket_key: str, status: str) -> bool:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.put(
                    f"{self.base_url}/issues/{ticket_key}.json",
                    json={"issue": {"status_id": int(status)}},
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                logger.info(
                    "Updated Redmine issue #%s to status %s", ticket_key, status
                )
                return True
            except httpx.HTTPError as e:
                logger.warning(
                    "Failed to update status on Redmine issue #%s: %s",
                    ticket_key,
                    e,
                )
                return False

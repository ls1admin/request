"""Description builder and ticket orchestration for Artemis developer requests."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from request_server.services.descriptions.blocks import (
    anonymous_notice_block,
    anonymous_requester_block,
    auto_comment_footer,
    comments_block,
    field,
    footer_block,
    heading,
    image,
    link,
    noformat_block,
    requester_info_block,
)

if TYPE_CHECKING:
    from request_server.models.artemis_developer_request import ArtemisDeveloperRequest
    from request_server.services.ticket.base import TicketService

logger = logging.getLogger(__name__)


class ArtemisDevDescriptionBuilder:
    """Builds summary, description, and welcome comment for Artemis developer requests."""

    def build_summary(
        self, artemis_request: ArtemisDeveloperRequest, is_authenticated: bool
    ) -> str:
        if is_authenticated:
            return f"[Artemis Dev] {artemis_request.github_username} - {artemis_request.requester_username}"
        return f"[Artemis Dev] {artemis_request.github_username} (anonymous: {artemis_request.anonymous_name})"

    def build_description(
        self, artemis_request: ArtemisDeveloperRequest, is_authenticated: bool
    ) -> str:
        sections = [
            heading(2, "Artemis Developer Access Request"),
            "",
        ]

        if not is_authenticated:
            sections.extend(
                [
                    anonymous_notice_block("Please verify the request details carefully."),
                    "",
                ]
            )

        # Requester info
        sections.append(heading(3, "Requester Information"))
        if is_authenticated:
            sections.append(
                requester_info_block(
                    artemis_request.requester_username,
                    artemis_request.requester_name,
                    artemis_request.requester_email,
                    username_label="TUM Username",
                )
            )
        else:
            sections.append(
                anonymous_requester_block(
                    artemis_request.anonymous_name,
                    artemis_request.anonymous_email,
                )
            )

        # GitHub info
        sections.extend(
            [
                "",
                heading(3, "GitHub Profile"),
            ]
        )

        if artemis_request.github_avatar_url:
            sections.append(image(artemis_request.github_avatar_url, alt="GitHub Avatar", width=64))
            sections.append("")

        profile_url = (
            artemis_request.github_profile_url
            or f"https://github.com/{artemis_request.github_username}"
        )
        sections.append(
            field(
                "GitHub Username",
                link(artemis_request.github_username, profile_url),
            )
        )

        if artemis_request.github_name:
            sections.append(field("GitHub Display Name", artemis_request.github_name))

        sections.append(
            field("Profile Verified", "Yes - GitHub profile exists and was verified")
        )

        # Artemis details
        sections.extend(
            [
                "",
                heading(3, "Artemis Team Details"),
                field("Slack Email", artemis_request.slack_email),
                field("Contact Person", artemis_request.contact_person),
                field("Advisor", artemis_request.advisor),
                field(
                    "Subteams",
                    self._format_subteams(artemis_request.subteams, artemis_request.other_subteam),
                ),
            ]
        )

        comments = comments_block(artemis_request.additional_comments)
        if comments:
            sections.append(comments)

        # CSV import line
        csv_line = self._build_csv_import_line(artemis_request, is_authenticated)
        sections.extend(
            [
                "",
                heading(3, "CSV Import Line"),
                noformat_block(csv_line),
                "",
                footer_block(str(artemis_request.id), artemis_request.created_at),
            ]
        )

        return "\n".join(sections)

    def build_comment(
        self,
        artemis_request: ArtemisDeveloperRequest,
        is_authenticated: bool,
        requester_username: str | None,
    ) -> str:
        resources_list = (
            "- Confluence and Bamboo\n"
            "- The Artemis test servers\n"
            f"- [GitHub](https://github.com/ls1intum)\n"
            f"- Slack channels (invitation will be sent to {artemis_request.slack_email})\n"
            f"- [Grafana](https://grafana.monitoring.aet.cit.tum.de/) for logs and monitoring of the test servers (select Keycloak for login)"
        )

        if is_authenticated and requester_username:
            return (
                f"Hello @{requester_username},\n\n"
                f"Your Artemis developer access request has been received.\n\n"
                f"**What happens next:**\n"
                f"1. Our team will review your request\n"
                f"2. If approved, you will be granted access to the Artemis development resources\n"
                f"3. You will be notified once access has been granted\n\n"
                f"**Once approved, you will have access to:**\n"
                f"{resources_list}\n\n"
                f"If you have any questions, please comment on this ticket or contact the AET team."
                f"{auto_comment_footer()}"
            )

        return (
            f"Hello,\n\n"
            f"An Artemis developer access request for **{artemis_request.anonymous_name}** has been received.\n\n"
            f"**What happens next:**\n"
            f"1. Our team will review your request\n"
            f"2. If approved, access to the Artemis development resources will be granted\n"
            f"3. You will be notified at {artemis_request.anonymous_email} once access has been granted\n\n"
            f"**Once approved, the following resources will be accessible:**\n"
            f"{resources_list}\n\n"
            f"If you have any questions, please reach out to the AET team."
            f"{auto_comment_footer()}"
        )

    # ── Private helpers ─────────────────────────────────────────────────

    def _format_subteams(self, subteams: list[str], other_subteam: str | None) -> str:
        formatted = []
        for team in subteams:
            if team == "other" and other_subteam:
                formatted.append(f"Other ({other_subteam})")
            else:
                team_display = team.replace("-", " ").title()
                if team == "lti":
                    team_display = "LTI"
                formatted.append(team_display)
        return ", ".join(formatted)

    def _format_subteams_csv(self, subteams: list[str], other_subteam: str | None) -> str:
        formatted = []
        for team in subteams:
            if team == "other" and other_subteam:
                formatted.append(other_subteam.capitalize())
            else:
                formatted.append(team.capitalize())
        return '"' + ",".join(formatted) + '"'

    def _get_requester_display_name(
        self, artemis_request: ArtemisDeveloperRequest, is_authenticated: bool
    ) -> str:
        if is_authenticated:
            return artemis_request.requester_name or artemis_request.requester_username or "Unknown"
        return artemis_request.anonymous_name or "Unknown"

    def _get_requester_email(
        self, artemis_request: ArtemisDeveloperRequest, is_authenticated: bool
    ) -> str:
        if is_authenticated:
            return artemis_request.requester_email or ""
        return artemis_request.anonymous_email or ""

    def _get_requester_tumid(
        self, artemis_request: ArtemisDeveloperRequest, is_authenticated: bool
    ) -> str:
        if is_authenticated:
            return artemis_request.requester_username or ""
        return ""

    def _build_csv_import_line(
        self, artemis_request: ArtemisDeveloperRequest, is_authenticated: bool
    ) -> str:
        requester_name = self._get_requester_display_name(artemis_request, is_authenticated)
        name_parts = requester_name.split(" ", 1)
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        tumid = self._get_requester_tumid(artemis_request, is_authenticated)
        email = self._get_requester_email(artemis_request, is_authenticated)
        csv_teams = self._format_subteams_csv(
            artemis_request.subteams, artemis_request.other_subteam
        )
        return f"{tumid},{first_name},{last_name},{email},{artemis_request.github_username},{artemis_request.slack_email},{csv_teams},False,False,False,True,False,False,False,False,False,False,False"


async def handle_artemis_ticket_creation(
    ticket_service: TicketService,
    artemis_request: ArtemisDeveloperRequest,
    is_authenticated: bool,
    requester_username: str | None = None,
) -> str | None:
    """Orchestrate Artemis developer request ticket creation."""
    from request_server.core.config import settings
    from request_server.services.ticket.base import CommentRequest, TicketCreateRequest

    builder = ArtemisDevDescriptionBuilder()

    ticket_key = await ticket_service.create_ticket(
        TicketCreateRequest(
            summary=builder.build_summary(artemis_request, is_authenticated),
            description=builder.build_description(artemis_request, is_authenticated),
            reporter_username=requester_username if is_authenticated else None,
            reporter_name=artemis_request.requester_name if is_authenticated else None,
            reporter_email=artemis_request.requester_email if is_authenticated else None,
        )
    )

    if ticket_key:
        await ticket_service.set_custom_field(
            ticket_key,
            settings.secondary_reporter_field,
            {"name": settings.service_account_name},
        )
        if is_authenticated:
            await ticket_service.add_comment(
                CommentRequest(
                    ticket_key=ticket_key,
                    body=builder.build_comment(artemis_request, is_authenticated, requester_username),
                )
            )

    return ticket_key if is_authenticated else None

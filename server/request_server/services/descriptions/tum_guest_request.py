"""Description builder and ticket orchestration for TUM guest account requests."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from request_server.services.descriptions.blocks import (
    anonymous_notice_block,
    auto_comment_footer,
    comments_block,
    field,
    footer_block,
    heading,
    italic,
    requester_info_block,
)

if TYPE_CHECKING:
    from request_server.models.tum_guest_request import TUMGuestRequest
    from request_server.services.ticket.base import TicketService

logger = logging.getLogger(__name__)

_GENDER_MAP = {"male": "Male", "female": "Female", "diverse": "Diverse"}


class TUMGuestRequestDescriptionBuilder:
    """Builds summary, description, and welcome comment for TUM guest requests."""

    def build_summary(
        self, guest_request: TUMGuestRequest, is_authenticated: bool
    ) -> str:
        guest_name = f"{guest_request.guest_first_name} {guest_request.guest_last_name}"
        if is_authenticated:
            return f"[TUM Guest] {guest_name} (requested by {guest_request.requester_username})"
        return f"[TUM Guest] {guest_name} (anonymous request)"

    def build_description(
        self, guest_request: TUMGuestRequest, is_authenticated: bool
    ) -> str:
        sections = [
            heading(2, "TUM Guest Account Request"),
            "",
        ]

        if not is_authenticated:
            sections.extend(
                [
                    anonymous_notice_block(
                        "Please verify the contact person and request details carefully."
                    ),
                    "",
                ]
            )

        # Requester/Submitter info
        sections.append(heading(3, "Request Submitted By"))
        if is_authenticated:
            sections.extend(
                [
                    requester_info_block(
                        guest_request.requester_username,
                        guest_request.requester_name,
                        guest_request.requester_email,
                    ),
                    italic("This user is requesting a guest account for someone else."),
                ]
            )
        else:
            if guest_request.requesting_for_self:
                sections.append(italic("Anonymous user requesting account for themselves."))
            else:
                sections.append(italic("Anonymous user requesting account for someone else."))
            sections.append(
                field("Contact Person at TUM", guest_request.contact_person or "N/A")
            )

        # Guest personal information
        sections.extend(
            [
                "",
                heading(3, "Guest Information"),
                field("First Name", guest_request.guest_first_name),
                field("Last Name", guest_request.guest_last_name),
                field("Email", guest_request.guest_email),
                field("Date of Birth", guest_request.guest_birth_date.strftime("%Y-%m-%d")),
                field(
                    "Gender",
                    _GENDER_MAP.get(guest_request.guest_gender.value, guest_request.guest_gender.value),
                ),
                field("Nationality", guest_request.guest_nationality),
            ]
        )

        # Guest type details
        sections.extend(
            [
                "",
                heading(3, "Request Type"),
                self._format_guest_type_details(guest_request),
            ]
        )

        comments = comments_block(guest_request.additional_comments)
        if comments:
            sections.append(comments)

        sections.extend(
            [
                "",
                footer_block(str(guest_request.id), guest_request.created_at),
            ]
        )

        return "\n".join(sections)

    def build_comment(
        self,
        guest_request: TUMGuestRequest,
        is_authenticated: bool,
        requester_username: str | None,
    ) -> str:
        guest_name = f"{guest_request.guest_first_name} {guest_request.guest_last_name}"

        if is_authenticated and requester_username:
            return (
                f"Hello @{requester_username},\n\n"
                f"Your TUM guest account request for **{guest_name}** has been received.\n\n"
                f"**What happens next:**\n"
                f"1. We will create the account - this may take a few days as manual intervention is required\n"
                f"2. The guest ({guest_request.guest_email}) will receive an email with a PIN code\n"
                f"3. They must activate their account within 7 days of receiving the PIN\n"
                f"4. They will set a secure password in TUMonline during activation\n"
                f"5. Once activated, they can log in to all our systems using their new TUMID and password\n\n"
                f"If you encounter problems, please reach out to ls1.admin@in.tum.de."
                f"{auto_comment_footer()}"
            )

        if guest_request.requesting_for_self:
            return (
                f"Hello,\n\n"
                f"Your TUM guest account request has been received.\n\n"
                f"**What happens next:**\n"
                f"1. You will receive an email confirming your request to {guest_request.guest_email}\n"
                f"2. We will create the account for you - this may take a few days as manual intervention is required\n"
                f"3. You will receive an email with a PIN code to the address you supplied in this form\n"
                f"4. Please make sure to activate your account within 7 days of receiving the PIN\n"
                f"5. Set a secure password in TUMonline (you will be prompted to do so)\n"
                f"6. You can then log in to all our systems using your new TUMID (e.g. ga12xyz) and the password you set\n\n"
                f"If you encounter problems, please reach out to ls1.admin@in.tum.de."
                f"{auto_comment_footer()}"
            )

        return (
            f"Hello,\n\n"
            f"A TUM guest account request for **{guest_name}** has been received.\n\n"
            f"**What happens next:**\n"
            f"1. We will verify this request with the contact person at TUM\n"
            f"2. If approved, we will create the account - this may take a few days as manual intervention is required\n"
            f"3. The guest ({guest_request.guest_email}) will receive an email with a PIN code\n"
            f"4. They must activate their account within 7 days of receiving the PIN\n"
            f"5. They will set a secure password in TUMonline during activation\n"
            f"6. Once activated, they can log in to all our systems using their new TUMID and password\n\n"
            f"If you encounter problems, please reach out to ls1.admin@in.tum.de."
            f"{auto_comment_footer()}"
        )

    # ── Private helpers ─────────────────────────────────────────────────

    def _format_guest_type_details(self, guest_request: TUMGuestRequest) -> str:
        details = guest_request.guest_type_details
        guest_type = guest_request.guest_type.value

        if guest_type == "ipraktikum-customer":
            return "\n".join(
                [
                    field("Guest Type", "iPraktikum Customer"),
                    field("Team Name", details.get("team_name", "N/A")),
                    field("Coach/PL Name", details.get("coach_name", "N/A")),
                ]
            )
        if guest_type == "artemis":
            return "\n".join(
                [
                    field("Guest Type", "Artemis"),
                    field("University/Company", details.get("university_or_company", "N/A")),
                ]
            )
        if guest_type == "other":
            return "\n".join(
                [
                    field("Guest Type", "Other"),
                    field("Reason", details.get("reason", "N/A")),
                ]
            )
        return field("Guest Type", guest_type)


async def handle_tum_guest_ticket_creation(
    ticket_service: TicketService,
    guest_request: TUMGuestRequest,
    is_authenticated: bool,
    requester_username: str | None = None,
) -> str | None:
    """Orchestrate TUM guest request ticket creation."""
    from request_server.core.config import settings
    from request_server.services.ticket.base import CommentRequest, TicketCreateRequest

    builder = TUMGuestRequestDescriptionBuilder()

    ticket_key = await ticket_service.create_ticket(
        TicketCreateRequest(
            summary=builder.build_summary(guest_request, is_authenticated),
            description=builder.build_description(guest_request, is_authenticated),
            reporter_username=requester_username if is_authenticated else None,
        )
    )

    if ticket_key:
        await ticket_service.set_custom_field(
            ticket_key, "customfield_12200", {"name": settings.jira_username}
        )
        await ticket_service.add_comment(
            CommentRequest(
                ticket_key=ticket_key,
                body=builder.build_comment(guest_request, is_authenticated, requester_username),
            )
        )

    return ticket_key

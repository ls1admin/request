"""Description builder and ticket orchestration for VM access requests."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from request_server.services.descriptions.blocks import (
    account_info_block,
    auto_comment_footer,
    field,
    footer_block,
    heading,
)

if TYPE_CHECKING:
    from request_server.models.vm_access_request import VMAccessRequest
    from request_server.services.ticket.base import TicketService

logger = logging.getLogger(__name__)


class VMAccessRequestDescriptionBuilder:
    """Builds summary, description, and welcome comment for VM access requests."""

    def build_summary(self, access_request: VMAccessRequest) -> str:
        return f"[VM Access] {access_request.hostname} - {access_request.requester_username}"

    def build_description(
        self, access_request: VMAccessRequest, public_key: str | None = None
    ) -> str:
        sections = [
            heading(2, "VM Access Request Details"),
            "",
            heading(3, "Requester Information"),
            field("Username", access_request.requester_username),
            field("Name", access_request.requester_name or "N/A"),
            field("Email", access_request.requester_email or "N/A"),
            "",
            heading(3, "Target VM"),
            field("Hostname", access_request.hostname),
            "",
            heading(3, "Request Details"),
            "**Justification:**",
            access_request.justification,
        ]

        if access_request.contact_person:
            sections.extend(
                [
                    "",
                    field("Contact Person", access_request.contact_person),
                ]
            )

        sections.extend(
            [
                "",
                heading(3, "Account Info"),
                account_info_block(
                    access_request.requester_username,
                    access_request.requester_name,
                    access_request.requester_email,
                    public_key,
                ),
                "",
                footer_block(str(access_request.id), access_request.created_at),
            ]
        )

        return "\n".join(sections)

    def build_comment(self, access_request: VMAccessRequest) -> str:
        return (
            f"Hello @{access_request.requester_username},\n\n"
            f"Your request for access to **{access_request.hostname}** has been received.\n\n"
            f"**What happens next:**\n"
            f"1. Our team will verify your request with the VM owner/contact person\n"
            f"2. If approved, your SSH key will be added to the VM\n"
            f"3. You will be notified once access has been granted\n\n"
            f"**Estimated timeline:** 1-3 business days\n\n"
            f"If you have any questions, please comment on this ticket or contact the AET team."
            f"{auto_comment_footer()}"
        )


async def handle_vm_access_ticket_creation(
    ticket_service: TicketService,
    access_request: VMAccessRequest,
    public_key: str | None = None,
) -> str | None:
    """Orchestrate VM access request ticket creation."""
    from request_server.core.config import settings
    from request_server.services.ticket.base import CommentRequest, TicketCreateRequest

    builder = VMAccessRequestDescriptionBuilder()

    ticket_key = await ticket_service.create_ticket(
        TicketCreateRequest(
            summary=builder.build_summary(access_request),
            description=builder.build_description(access_request, public_key),
            reporter_username=access_request.requester_username,
            reporter_name=access_request.requester_name,
            reporter_email=access_request.requester_email,
        )
    )

    if ticket_key:
        await ticket_service.set_custom_field(
            ticket_key,
            settings.secondary_reporter_field,
            {"name": settings.service_account_name},
        )
        await ticket_service.add_comment(
            CommentRequest(
                ticket_key=ticket_key,
                body=builder.build_comment(access_request),
            )
        )

    return ticket_key

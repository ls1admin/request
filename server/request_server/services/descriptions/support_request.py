"""Description builder and ticket orchestration for support requests."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from request_server.schemas.support_request import CATEGORY_LABELS
from request_server.services.descriptions.blocks import (
    anonymous_notice_block,
    anonymous_requester_block,
    auto_comment_footer,
    field,
    footer_block,
    heading,
    requester_info_block,
)

if TYPE_CHECKING:
    from request_server.models.support_request import SupportRequest
    from request_server.services.ticket.base import TicketService

logger = logging.getLogger(__name__)


class SupportRequestDescriptionBuilder:
    """Builds summary, description, and welcome comment for support requests."""

    def build_summary(self, support_request: SupportRequest, is_authenticated: bool) -> str:
        if is_authenticated:
            return f"[Support] {support_request.subject} - {support_request.requester_username}"
        return f"[Support] {support_request.subject} - {support_request.anonymous_name} (anonymous)"

    def build_description(self, support_request: SupportRequest, is_authenticated: bool) -> str:
        sections = [
            heading(2, "Support Request"),
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
                    support_request.requester_username,
                    support_request.requester_name,
                    support_request.requester_email,
                )
            )
        else:
            sections.append(
                anonymous_requester_block(
                    support_request.anonymous_name,
                    support_request.anonymous_email,
                )
            )
            if support_request.anonymous_tum_id:
                sections.append(field("TUM Identifier", support_request.anonymous_tum_id))

        # Support details
        category_label = CATEGORY_LABELS.get(
            support_request.category.value, support_request.category.value
        )
        sections.extend(
            [
                "",
                heading(3, "Request Details"),
                field("Category", category_label),
                field("Subject", support_request.subject),
                "",
                heading(3, "Description"),
                support_request.description,
                "",
                footer_block(str(support_request.id), support_request.created_at),
            ]
        )

        return "\n".join(sections)

    def build_comment(
        self,
        support_request: SupportRequest,
        is_authenticated: bool,
        requester_username: str | None,
    ) -> str:
        if is_authenticated and requester_username:
            return (
                f"Hello @{requester_username},\n\n"
                f"Your support request has been received and is being reviewed.\n\n"
                f"**What happens next:**\n"
                f"1. Our team will review your request\n"
                f"2. You will be notified of any updates on this ticket\n"
                f"3. Feel free to add comments if you have additional information\n\n"
                f"If you have any questions, please comment on this ticket."
                f"{auto_comment_footer()}"
            )

        return (
            f"Hello,\n\n"
            f"A support request from **{support_request.anonymous_name}** has been received.\n\n"
            f"**What happens next:**\n"
            f"1. Our team will review the request\n"
            f"2. Updates will be sent to {support_request.anonymous_email}\n\n"
            f"If you have any questions, please reach out to the AET team."
            f"{auto_comment_footer()}"
        )


async def handle_support_ticket_creation(
    ticket_service: TicketService,
    support_request: SupportRequest,
    is_authenticated: bool,
    requester_username: str | None = None,
) -> str | None:
    """Orchestrate support request ticket creation."""
    from request_server.core.config import settings
    from request_server.services.ticket.base import CommentRequest, TicketCreateRequest

    builder = SupportRequestDescriptionBuilder()

    ticket_key = await ticket_service.create_ticket(
        TicketCreateRequest(
            summary=builder.build_summary(support_request, is_authenticated),
            description=builder.build_description(support_request, is_authenticated),
            reporter_username=requester_username if is_authenticated else None,
            reporter_name=support_request.requester_name if is_authenticated else None,
            reporter_email=support_request.requester_email if is_authenticated else None,
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
                    body=builder.build_comment(
                        support_request, is_authenticated, requester_username
                    ),
                )
            )

    return ticket_key if is_authenticated else None

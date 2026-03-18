"""Description builder and ticket orchestration for VM requests."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from request_server.services.descriptions.blocks import (
    account_info_block,
    auto_comment_footer,
    comments_block,
    field,
    footer_block,
    heading,
    ssh_key_block,
)

if TYPE_CHECKING:
    from request_server.models.vm_request import VMRequest
    from request_server.services.ticket.base import TicketService

logger = logging.getLogger(__name__)


class VMRequestDescriptionBuilder:
    """Builds summary, description, and welcome comment for VM requests."""

    def build_summary(self, vm_request: VMRequest) -> str:
        return f"[VM Request] {vm_request.hostname} - {vm_request.requester_username}"

    def build_description(self, vm_request: VMRequest, public_key: str | None = None) -> str:
        sections = [
            heading(2, "VM Request Details"),
            "",
            heading(3, "Requester Information"),
            field("Username", vm_request.requester_username),
            field("Name", vm_request.requester_name or "N/A"),
            field("Email", vm_request.requester_email or "N/A"),
            "",
            heading(3, "VM Configuration"),
            field("Hostname", vm_request.hostname),
            field("Description", vm_request.description),
            field("CPU Cores", str(vm_request.cpu_cores)),
            field("RAM", f"{vm_request.ram_gb} GB"),
        ]

        if vm_request.cpu_cores > 4 or vm_request.ram_gb > 4:
            justification = vm_request.resource_justification or "No justification provided"
            sections.append(field("Resource Justification", justification))

        sections.extend(
            [
                "",
                heading(3, "Project Information"),
                self._format_project_details(vm_request),
                "",
                heading(3, "Network Configuration"),
                self._format_ports(vm_request),
                "",
                heading(3, "Access Configuration"),
                self._format_users(vm_request),
                ssh_key_block(vm_request.ssh_key_type, vm_request.ssh_key_value),
            ]
        )

        comments = comments_block(vm_request.additional_comments)
        if comments:
            sections.append(comments)

        sections.extend(
            [
                "",
                heading(3, "Account Info"),
                account_info_block(
                    vm_request.requester_username,
                    vm_request.requester_name,
                    vm_request.requester_email,
                    public_key,
                ),
                "",
                footer_block(str(vm_request.id), vm_request.created_at),
            ]
        )

        return "\n".join(sections)

    def build_comment(self, vm_request: VMRequest) -> str:
        return (
            f"Hello @{vm_request.requester_username},\n\n"
            f"Your VM request for **{vm_request.hostname}** has been received and is being processed.\n\n"
            f"**What happens next:**\n"
            f"1. Our team will review your request\n"
            f"2. If approved, the VM will be provisioned\n"
            f"3. You will have access via SSH using the provided credentials (SSH-Pub-Key)\n\n"
            f"**Estimated timeline:** 1-3 business days\n\n"
            f"If you have any questions, please comment on this ticket or contact the AET team."
            f"{auto_comment_footer()}"
        )

    # ── Private helpers ─────────────────────────────────────────────────

    def _format_project_details(self, vm_request: VMRequest) -> str:
        details = vm_request.project_details
        project_type = vm_request.project_type.value

        if project_type == "ipraktikum":
            return "\n".join(
                [
                    field("Project Type", "iPraktikum"),
                    field("Team Name", details.get("team_name", "N/A")),
                    field("Coach Name", details.get("coach_name", "N/A")),
                ]
            )
        if project_type == "thesis":
            return "\n".join(
                [
                    field("Project Type", "Thesis"),
                    field("Study Level", details.get("study_level", "N/A")),
                    field("Advisor", details.get("advisor", "N/A")),
                    field("Working Title", details.get("title", "N/A")),
                ]
            )
        if project_type == "chair_project":
            lines = [
                field("Project Type", "Chair Project"),
                field("Project Name", details.get("project_name", "N/A")),
                field("Project Description", details.get("project_description", "N/A")),
            ]
            responsible = details.get("responsible_person")
            if responsible:
                lines.append(field("Responsible Person", responsible))
            return "\n".join(lines)
        return f"{field('Project Type', project_type)}\n{field('Details', str(details))}"

    def _format_ports(self, vm_request: VMRequest) -> str:
        lines = [
            field(
                "Default Ports Enabled",
                "Yes" if vm_request.default_ports_enabled else "No",
            )
        ]

        if vm_request.additional_ports:
            lines.append("**Additional Ports:**")
            for port_info in vm_request.additional_ports:
                port = port_info.get("port", "N/A")
                protocol = port_info.get("protocol", "tcp")
                reason = port_info.get("reason", "No reason provided")
                lines.append(f"  - {port}/{protocol}: {reason}")
        else:
            lines.append(field("Additional Ports", "None"))

        return "\n".join(lines)

    def _format_users(self, vm_request: VMRequest) -> str:
        if vm_request.additional_users:
            return field("Additional Users", ", ".join(vm_request.additional_users))
        return field("Additional Users", "None")


async def handle_vm_ticket_creation(
    ticket_service: TicketService,
    vm_request: VMRequest,
    public_key: str | None = None,
) -> str | None:
    """Orchestrate VM request ticket creation.

    Creates ticket, sets secondary reporter, adds welcome comment.
    """
    from request_server.core.config import settings
    from request_server.services.ticket.base import CommentRequest, TicketCreateRequest

    builder = VMRequestDescriptionBuilder()

    ticket_key = await ticket_service.create_ticket(
        TicketCreateRequest(
            summary=builder.build_summary(vm_request),
            description=builder.build_description(vm_request, public_key),
            reporter_username=vm_request.requester_username,
            reporter_name=vm_request.requester_name,
            reporter_email=vm_request.requester_email,
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
                body=builder.build_comment(vm_request),
            )
        )

    return ticket_key

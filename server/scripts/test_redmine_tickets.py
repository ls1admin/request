#!/usr/bin/env python3
"""Create test tickets in Redmine for each request type.

Usage:
    cd server
    python -m scripts.test_redmine_tickets [--type vm|vm-access|artemis|tum-guest|all]

Creates realistic sample tickets using the real description builders and ticket
service, bypassing the database entirely. Useful for verifying formatting,
custom fields, and user provisioning against a Redmine test instance.
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import uuid
from datetime import UTC, date, datetime
from types import SimpleNamespace
from typing import Any

# Bootstrap settings before importing anything that reads them
from request_server.core.config import settings
from request_server.services.ticket import get_ticket_service
from request_server.services.ticket.base import TicketCreateRequest

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
logger = logging.getLogger("test_redmine_tickets")


# ── Fake model helpers ────────────────────────────────────────────────────────
# We create lightweight namespace objects that quack like SQLAlchemy models
# so the description builders work without a database.


def _fake_id() -> uuid.UUID:
    return uuid.uuid4()


def _now() -> datetime:
    return datetime.now(UTC)


def fake_vm_request() -> Any:
    return SimpleNamespace(
        id=_fake_id(),
        requester_id="test-user-id",
        requester_username="ge65bew",
        requester_name="Magnus Kühne",
        requester_email="magnus.kuehne@tum.de",
        hostname="test-vm-01",
        description="Test VM for Redmine integration verification",
        project_type=SimpleNamespace(value="thesis"),
        project_details={
            "study_level": "MA",
            "advisor": "Prof. Krusche",
            "title": "Evaluating Ticket System Integrations",
        },
        cpu_cores=4,
        ram_gb=8,
        resource_justification="Need extra RAM for CI builds",
        default_ports_enabled=True,
        additional_ports=[
            {"port": 8080, "protocol": "tcp", "reason": "Web server"},
            {"port": 443, "protocol": "tcp", "reason": "HTTPS"},
        ],
        additional_users=["ab12cde"],
        ssh_key_type="new",
        ssh_key_value="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAITestKey test@example",
        additional_comments="This is a test ticket created by the Redmine test script.",
        status="pending",
        created_at=_now(),
        updated_at=_now(),
    )


def fake_vm_access_request() -> Any:
    return SimpleNamespace(
        id=_fake_id(),
        requester_id="test-user-id",
        requester_username="ge65bew",
        requester_name="Magnus Kühne",
        requester_email="magnus.kuehne@tum.de",
        hostname="prod-artemis",
        justification="Need access to debug deployment issues on the production Artemis server.",
        contact_person="Prof. Krusche",
        ssh_key_type="new",
        ssh_key_value="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAITestKey test@example",
        status="pending",
        created_at=_now(),
        updated_at=_now(),
    )


def fake_artemis_request(*, authenticated: bool = True) -> Any:
    base = SimpleNamespace(
        id=_fake_id(),
        is_authenticated_request=authenticated,
        github_username="test-developer",
        github_user_id=12345678,
        github_avatar_url="https://avatars.githubusercontent.com/u/12345678",
        github_profile_url="https://github.com/test-developer",
        github_name="Test Developer",
        github_verified=True,
        slack_email="test.developer@tum.de",
        contact_person="Prof. Krusche",
        advisor="John Doe",
        subteams=["programming-exercises", "communication"],
        other_subteam=None,
        additional_comments="Test Artemis ticket from Redmine test script.",
        status="pending",
        created_at=_now(),
        updated_at=_now(),
    )
    if authenticated:
        base.requester_id = "test-user-id"
        base.requester_username = "ge65bew"
        base.requester_name = "Magnus Kühne"
        base.requester_email = "magnus.kuehne@tum.de"
        base.anonymous_name = None
        base.anonymous_email = None
    else:
        base.requester_id = None
        base.requester_username = None
        base.requester_name = None
        base.requester_email = None
        base.anonymous_name = "External Developer"
        base.anonymous_email = "external@example.com"
    return base


def fake_tum_guest_request(*, authenticated: bool = True) -> Any:
    base = SimpleNamespace(
        id=_fake_id(),
        is_authenticated_request=authenticated,
        requesting_for_self=False,
        guest_first_name="Jane",
        guest_last_name="Smith",
        guest_email="jane.smith@example.com",
        guest_birth_date=date(1995, 6, 15),
        guest_gender=SimpleNamespace(value="female"),
        guest_nationality="british",
        guest_type=SimpleNamespace(value="artemis"),
        guest_type_details={"university_or_company": "University of Oxford"},
        contact_person="Prof. Krusche",
        additional_comments="Test TUM guest ticket from Redmine test script.",
        status="pending",
        created_at=_now(),
        updated_at=_now(),
    )
    if authenticated:
        base.requester_id = "test-user-id"
        base.requester_username = "ge65bew"
        base.requester_name = "Magnus Kühne"
        base.requester_email = "magnus.kuehne@tum.de"
    else:
        base.requester_id = None
        base.requester_username = None
        base.requester_name = None
        base.requester_email = None
        base.requesting_for_self = True
    return base


# ── Ticket creation runners ──────────────────────────────────────────────────


async def create_vm_ticket(ticket_service: Any) -> str | None:
    from request_server.services.descriptions.vm_request import handle_vm_ticket_creation

    req = fake_vm_request()
    logger.info("Creating VM Request ticket for '%s'...", req.hostname)
    key = await handle_vm_ticket_creation(ticket_service, req, public_key=req.ssh_key_value)
    return key


async def create_vm_access_ticket(ticket_service: Any) -> str | None:
    from request_server.services.descriptions.vm_access_request import (
        handle_vm_access_ticket_creation,
    )

    req = fake_vm_access_request()
    logger.info("Creating VM Access Request ticket for '%s'...", req.hostname)
    key = await handle_vm_access_ticket_creation(
        ticket_service, req, public_key=req.ssh_key_value
    )
    return key


async def create_artemis_ticket(ticket_service: Any, *, authenticated: bool = True) -> str | None:
    from request_server.services.descriptions.artemis_developer_request import (
        ArtemisDevDescriptionBuilder,
        handle_artemis_ticket_creation,
    )

    req = fake_artemis_request(authenticated=authenticated)
    label = "authenticated" if authenticated else "anonymous"
    logger.info("Creating Artemis Dev ticket (%s) for '%s'...", label, req.github_username)

    if authenticated:
        return await handle_artemis_ticket_creation(
            ticket_service,
            req,
            is_authenticated=True,
            requester_username=req.requester_username,
        )

    # Anonymous: orchestrator returns None by design, so create directly to verify
    builder = ArtemisDevDescriptionBuilder()
    key = await ticket_service.create_ticket(
        TicketCreateRequest(
            summary=builder.build_summary(req, False),
            description=builder.build_description(req, False),
        )
    )
    if key:
        logger.info("  (anonymous — ticket created, key not returned to user by design)")
    return key


async def create_tum_guest_ticket(
    ticket_service: Any, *, authenticated: bool = True
) -> str | None:
    from request_server.services.descriptions.tum_guest_request import (
        TUMGuestRequestDescriptionBuilder,
        handle_tum_guest_ticket_creation,
    )

    req = fake_tum_guest_request(authenticated=authenticated)
    label = "authenticated" if authenticated else "anonymous"
    logger.info(
        "Creating TUM Guest ticket (%s) for '%s %s'...",
        label,
        req.guest_first_name,
        req.guest_last_name,
    )

    if authenticated:
        return await handle_tum_guest_ticket_creation(
            ticket_service,
            req,
            is_authenticated=True,
            requester_username=req.requester_username,
        )

    # Anonymous: orchestrator returns None by design, so create directly to verify
    builder = TUMGuestRequestDescriptionBuilder()
    key = await ticket_service.create_ticket(
        TicketCreateRequest(
            summary=builder.build_summary(req, False),
            description=builder.build_description(req, False),
        )
    )
    if key:
        logger.info("  (anonymous — ticket created, key not returned to user by design)")
    return key


# ── Main ──────────────────────────────────────────────────────────────────────

TICKET_TYPES = {
    "vm": [("VM Request", create_vm_ticket)],
    "vm-access": [("VM Access Request", create_vm_access_ticket)],
    "artemis": [
        ("Artemis Dev (auth)", lambda ts: create_artemis_ticket(ts, authenticated=True)),
        ("Artemis Dev (anon)", lambda ts: create_artemis_ticket(ts, authenticated=False)),
    ],
    "tum-guest": [
        ("TUM Guest (auth)", lambda ts: create_tum_guest_ticket(ts, authenticated=True)),
        ("TUM Guest (anon)", lambda ts: create_tum_guest_ticket(ts, authenticated=False)),
    ],
}


async def main() -> None:
    parser = argparse.ArgumentParser(description="Create test tickets in Redmine")
    parser.add_argument(
        "--type",
        choices=[*TICKET_TYPES.keys(), "all"],
        default="all",
        help="Which request type(s) to create (default: all)",
    )
    args = parser.parse_args()

    # Validate configuration
    if settings.ticket_system != "redmine":
        logger.error("TICKET_SYSTEM is '%s', expected 'redmine'. Aborting.", settings.ticket_system)
        return
    if not settings.redmine_enabled:
        logger.error(
            "Redmine is not fully configured. Check REDMINE_URL, REDMINE_API_KEY, REDMINE_PROJECT."
        )
        return

    logger.info("Redmine URL: %s", settings.redmine_url)
    logger.info("Project: %s", settings.redmine_project)
    logger.info("Tracker ID: %s", settings.redmine_tracker_id or "(default)")
    logger.info("")

    ticket_service = get_ticket_service()

    # Determine which types to run
    if args.type == "all":
        types_to_run = list(TICKET_TYPES.keys())
    else:
        types_to_run = [args.type]

    results: list[tuple[str, str | None]] = []

    for ticket_type in types_to_run:
        for label, creator in TICKET_TYPES[ticket_type]:
            key = await creator(ticket_service)
            results.append((label, key))

    # Summary
    logger.info("")
    logger.info("=" * 60)
    logger.info("RESULTS")
    logger.info("=" * 60)
    for label, key in results:
        if key:
            url = f"{settings.redmine_url.rstrip('/')}/issues/{key}"
            logger.info("  ✓ %-25s  #%-6s  %s", label, key, url)
        else:
            logger.info("  ✗ %-25s  FAILED", label)

    failed = sum(1 for _, k in results if k is None)
    if failed:
        logger.warning("%d/%d tickets failed to create.", failed, len(results))
    else:
        logger.info("All %d tickets created successfully.", len(results))


if __name__ == "__main__":
    asyncio.run(main())

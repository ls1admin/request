"""Debug API routes for E2E testing.

These routes are only registered when TICKET_SYSTEM=debug.
They provide access to captured ticket data and database cleanup.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from request_server.db.session import get_db
from request_server.services.ticket import get_ticket_service
from request_server.services.ticket.debug import DebugTicketService

router = APIRouter(prefix="/debug", tags=["Debug (E2E Testing)"])


def _get_debug_service() -> DebugTicketService:
    svc = get_ticket_service()
    if not isinstance(svc, DebugTicketService):
        raise HTTPException(status_code=503, detail="Debug ticket service not active")
    return svc


@router.get("/tickets")
async def list_debug_tickets() -> list[dict]:
    """Return all captured ticket data."""
    return _get_debug_service().get_all_tickets()


@router.get("/tickets/latest")
async def get_latest_ticket() -> dict:
    """Return the most recently created ticket data."""
    ticket = _get_debug_service().get_latest_ticket()
    if ticket is None:
        raise HTTPException(status_code=404, detail="No tickets captured yet")
    return ticket


@router.delete("/tickets")
async def clear_debug_tickets() -> dict:
    """Clear all captured tickets. Called between tests."""
    _get_debug_service().clear_all()
    return {"status": "cleared"}


@router.delete("/db")
async def clear_database(db: Annotated[AsyncSession, Depends(get_db)]) -> dict:
    """Truncate all request tables. Called between tests."""
    tables = [
        "external_links",
        "external_link_sections",
        "vm_requests",
        "vm_access_requests",
        "tum_guest_requests",
        "artemis_developer_requests",
        "ssh_keys",
    ]
    for table in tables:
        await db.execute(text(f"TRUNCATE TABLE {table} CASCADE"))  # noqa: S608
    await db.commit()
    return {"status": "cleared", "tables": tables}

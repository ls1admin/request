"""External Links API routes."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from request_server.core.security import CurrentUser, get_current_admin_user
from request_server.db.session import get_db
from request_server.models.external_link import ExternalLink, ExternalLinkSection
from request_server.schemas.external_link import (
    ExternalLinkCreate,
    ExternalLinkResponse,
    ExternalLinkSectionCreate,
    ExternalLinkSectionResponse,
    ExternalLinkSectionUpdate,
    ExternalLinkUpdate,
    MoveRequest,
    ReorderRequest,
)

router = APIRouter(prefix="/external-links", tags=["External Links"])


# --- Public endpoints ---


@router.get("/sections", response_model=list[ExternalLinkSectionResponse])
async def list_sections(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[ExternalLinkSectionResponse]:
    """List all sections with enabled links only (public)."""
    query = (
        select(ExternalLinkSection)
        .options(selectinload(ExternalLinkSection.links))
        .order_by(ExternalLinkSection.display_order)
    )
    result = await db.execute(query)
    sections = list(result.scalars().unique().all())

    # Filter to enabled links only and build response
    responses = []
    for section in sections:
        enabled_links = [link for link in section.links if link.enabled]
        response = ExternalLinkSectionResponse.model_validate(section)
        response.links = [ExternalLinkResponse.model_validate(link) for link in enabled_links]
        responses.append(response)

    return responses


# --- Admin endpoints ---


@router.get("/sections/admin", response_model=list[ExternalLinkSectionResponse])
async def list_sections_admin(
    _admin: Annotated[CurrentUser, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[ExternalLinkSection]:
    """List all sections with all links including disabled (admin only)."""
    query = (
        select(ExternalLinkSection)
        .options(selectinload(ExternalLinkSection.links))
        .order_by(ExternalLinkSection.display_order)
    )
    result = await db.execute(query)
    return list(result.scalars().unique().all())


@router.post(
    "/sections",
    response_model=ExternalLinkSectionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_section(
    data: ExternalLinkSectionCreate,
    _admin: Annotated[CurrentUser, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ExternalLinkSection:
    """Create a new section."""
    # Auto-assign display_order if default (0) and others exist
    if data.display_order == 0:
        max_order_result = await db.execute(
            select(func.coalesce(func.max(ExternalLinkSection.display_order), -1))
        )
        max_order = max_order_result.scalar()
        data.display_order = max_order + 1

    section = ExternalLinkSection(
        title=data.title,
        icon=data.icon,
        display_order=data.display_order,
    )
    db.add(section)
    await db.flush()
    await db.refresh(section, attribute_names=["links"])
    return section


@router.put("/sections/{section_id}", response_model=ExternalLinkSectionResponse)
async def update_section(
    section_id: uuid.UUID,
    data: ExternalLinkSectionUpdate,
    _admin: Annotated[CurrentUser, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ExternalLinkSection:
    """Update a section."""
    query = (
        select(ExternalLinkSection)
        .options(selectinload(ExternalLinkSection.links))
        .where(ExternalLinkSection.id == section_id)
    )
    result = await db.execute(query)
    section = result.scalar_one_or_none()

    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    update_data = data.model_dump(exclude_unset=True, by_alias=False)
    for field, value in update_data.items():
        setattr(section, field, value)

    await db.flush()
    await db.refresh(section)
    return section


@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(
    section_id: uuid.UUID,
    _admin: Annotated[CurrentUser, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a section and all its links."""
    query = select(ExternalLinkSection).where(ExternalLinkSection.id == section_id)
    result = await db.execute(query)
    section = result.scalar_one_or_none()

    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    await db.delete(section)


@router.post(
    "/sections/{section_id}/links",
    response_model=ExternalLinkResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_link(
    section_id: uuid.UUID,
    data: ExternalLinkCreate,
    _admin: Annotated[CurrentUser, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ExternalLink:
    """Create a new link in a section."""
    # Verify section exists
    section_query = select(ExternalLinkSection).where(ExternalLinkSection.id == section_id)
    section_result = await db.execute(section_query)
    if not section_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    # Auto-assign display_order if default (0) and others exist
    if data.display_order == 0:
        max_order_result = await db.execute(
            select(func.coalesce(func.max(ExternalLink.display_order), -1)).where(
                ExternalLink.section_id == section_id
            )
        )
        max_order = max_order_result.scalar()
        data.display_order = max_order + 1

    link = ExternalLink(
        section_id=section_id,
        label=data.label,
        url=data.url,
        image_url=data.image_url,
        description=data.description,
        enabled=data.enabled,
        display_order=data.display_order,
    )
    db.add(link)
    await db.flush()
    await db.refresh(link)
    return link


@router.put("/links/{link_id}", response_model=ExternalLinkResponse)
async def update_link(
    link_id: uuid.UUID,
    data: ExternalLinkUpdate,
    _admin: Annotated[CurrentUser, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ExternalLink:
    """Update a link."""
    query = select(ExternalLink).where(ExternalLink.id == link_id)
    result = await db.execute(query)
    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")

    update_data = data.model_dump(exclude_unset=True, by_alias=False)
    for field, value in update_data.items():
        setattr(link, field, value)

    await db.flush()
    await db.refresh(link)
    return link


@router.delete("/links/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(
    link_id: uuid.UUID,
    _admin: Annotated[CurrentUser, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a link."""
    query = select(ExternalLink).where(ExternalLink.id == link_id)
    result = await db.execute(query)
    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")

    await db.delete(link)


@router.put("/links/{link_id}/move", response_model=ExternalLinkResponse)
async def move_link(
    link_id: uuid.UUID,
    data: MoveRequest,
    _admin: Annotated[CurrentUser, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ExternalLink:
    """Move a link to a different section."""
    # Verify link exists
    link_query = select(ExternalLink).where(ExternalLink.id == link_id)
    link_result = await db.execute(link_query)
    link = link_result.scalar_one_or_none()

    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")

    # Verify target section exists
    section_query = select(ExternalLinkSection).where(ExternalLinkSection.id == data.section_id)
    section_result = await db.execute(section_query)
    if not section_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Target section not found"
        )

    link.section_id = data.section_id
    link.display_order = data.display_order

    await db.flush()
    await db.refresh(link)
    return link


@router.put("/reorder", status_code=status.HTTP_204_NO_CONTENT)
async def reorder(
    data: ReorderRequest,
    _admin: Annotated[CurrentUser, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Bulk reorder sections and/or links."""
    if data.sections:
        for item in data.sections:
            query = select(ExternalLinkSection).where(ExternalLinkSection.id == item.id)
            result = await db.execute(query)
            section = result.scalar_one_or_none()
            if section:
                section.display_order = item.display_order

    if data.links:
        for item in data.links:
            query = select(ExternalLink).where(ExternalLink.id == item.id)
            result = await db.execute(query)
            link = result.scalar_one_or_none()
            if link:
                link.section_id = item.section_id
                link.display_order = item.display_order

    await db.flush()

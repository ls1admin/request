"""add_support_requests_table

Revision ID: d4e5f6g7h8i9
Revises: c3d4e5f6g7h8
Create Date: 2026-03-19 12:00:00.000000

"""
from typing import Union
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6g7h8i9'
down_revision: Union[str, None] = 'c3d4e5f6g7h8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE supportcategory AS ENUM ('bug', 'feature_request', 'question', 'other');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE supportrequeststatus AS ENUM ('pending', 'in_progress', 'resolved', 'closed');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    supportcategory_enum = postgresql.ENUM(
        'bug', 'feature_request', 'question', 'other',
        name='supportcategory',
        create_type=False
    )

    supportrequeststatus_enum = postgresql.ENUM(
        'pending', 'in_progress', 'resolved', 'closed',
        name='supportrequeststatus',
        create_type=False
    )

    # Create table
    op.create_table('support_requests',
        sa.Column('id', sa.UUID(), nullable=False),
        # Requester info (nullable for anonymous requests)
        sa.Column('requester_id', sa.String(length=255), nullable=True),
        sa.Column('requester_username', sa.String(length=255), nullable=True),
        sa.Column('requester_name', sa.String(length=255), nullable=True),
        sa.Column('requester_email', sa.String(length=255), nullable=True),
        # Authentication flag
        sa.Column('is_authenticated_request', sa.Boolean(), nullable=False, server_default='false'),
        # Anonymous user info
        sa.Column('anonymous_name', sa.String(length=255), nullable=True),
        sa.Column('anonymous_email', sa.String(length=255), nullable=True),
        sa.Column('anonymous_tum_id', sa.String(length=255), nullable=True),
        # Support details
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', supportcategory_enum, nullable=False),
        # Status
        sa.Column('status', supportrequeststatus_enum, nullable=False, server_default='pending'),
        # Admin fields
        sa.Column('reviewed_by', sa.String(length=255), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        # External references
        sa.Column('jira_ticket_key', sa.String(length=50), nullable=True),
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        op.f('ix_support_requests_requester_id'),
        'support_requests',
        ['requester_id'],
        unique=False
    )


def downgrade() -> None:
    op.drop_index(
        op.f('ix_support_requests_requester_id'),
        table_name='support_requests'
    )
    op.drop_table('support_requests')

    # Drop enum types
    op.execute('DROP TYPE IF EXISTS supportrequeststatus')
    op.execute('DROP TYPE IF EXISTS supportcategory')

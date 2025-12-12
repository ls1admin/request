"""add_artemis_developer_requests_table

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6g7
Create Date: 2025-12-23 12:00:00.000000

"""
from typing import Union
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6g7h8'
down_revision: Union[str, None] = 'b2c3d4e5f6g7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum type for Artemis request status
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE artemisrequeststatus AS ENUM ('pending', 'approved', 'rejected', 'completed');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    # Define enum type for use in table creation (create_type=False since we created it above)
    artemisrequeststatus_enum = postgresql.ENUM(
        'pending', 'approved', 'rejected', 'completed',
        name='artemisrequeststatus',
        create_type=False
    )

    # Create table
    op.create_table('artemis_developer_requests',
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
        # GitHub info
        sa.Column('github_username', sa.String(length=39), nullable=False),
        sa.Column('github_user_id', sa.Integer(), nullable=True),
        sa.Column('github_avatar_url', sa.String(length=500), nullable=True),
        sa.Column('github_profile_url', sa.String(length=500), nullable=True),
        sa.Column('github_name', sa.String(length=255), nullable=True),
        sa.Column('github_verified', sa.Boolean(), nullable=False, server_default='true'),
        # Artemis details
        sa.Column('slack_email', sa.String(length=255), nullable=False),
        sa.Column('contact_person', sa.String(length=255), nullable=False),
        sa.Column('advisor', sa.String(length=255), nullable=False),
        sa.Column('subteams', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('other_subteam', sa.String(length=255), nullable=True),
        # Additional info
        sa.Column('additional_comments', sa.Text(), nullable=True),
        # Status
        sa.Column('status', artemisrequeststatus_enum, nullable=False, server_default='pending'),
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
        op.f('ix_artemis_developer_requests_requester_id'),
        'artemis_developer_requests',
        ['requester_id'],
        unique=False
    )
    op.create_index(
        op.f('ix_artemis_developer_requests_github_username'),
        'artemis_developer_requests',
        ['github_username'],
        unique=False
    )


def downgrade() -> None:
    op.drop_index(
        op.f('ix_artemis_developer_requests_github_username'),
        table_name='artemis_developer_requests'
    )
    op.drop_index(
        op.f('ix_artemis_developer_requests_requester_id'),
        table_name='artemis_developer_requests'
    )
    op.drop_table('artemis_developer_requests')

    # Drop enum type
    op.execute('DROP TYPE IF EXISTS artemisrequeststatus')

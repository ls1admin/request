"""add_tum_guest_requests_table

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2025-12-18 16:00:00.000000

"""
from typing import Union
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types - use DO block to handle "already exists" gracefully
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE guesttype AS ENUM ('ipraktikum-customer', 'artemis', 'other');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE gender AS ENUM ('male', 'female', 'diverse');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE guestrequeststatus AS ENUM ('pending', 'approved', 'rejected', 'completed');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    # Define enum types for use in table creation (create_type=False since we created them above)
    guesttype_enum = postgresql.ENUM('ipraktikum-customer', 'artemis', 'other', name='guesttype', create_type=False)
    gender_enum = postgresql.ENUM('male', 'female', 'diverse', name='gender', create_type=False)
    guestrequeststatus_enum = postgresql.ENUM('pending', 'approved', 'rejected', 'completed', name='guestrequeststatus', create_type=False)

    # Create table
    op.create_table('tum_guest_requests',
        sa.Column('id', sa.UUID(), nullable=False),
        # Requester info (nullable for anonymous requests)
        sa.Column('requester_id', sa.String(length=255), nullable=True),
        sa.Column('requester_username', sa.String(length=255), nullable=True),
        sa.Column('requester_name', sa.String(length=255), nullable=True),
        sa.Column('requester_email', sa.String(length=255), nullable=True),
        # Authentication flags
        sa.Column('is_authenticated_request', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('requesting_for_self', sa.Boolean(), nullable=False, server_default='true'),
        # Guest personal info
        sa.Column('guest_first_name', sa.String(length=255), nullable=False),
        sa.Column('guest_last_name', sa.String(length=255), nullable=False),
        sa.Column('guest_email', sa.String(length=255), nullable=False),
        sa.Column('guest_birth_date', sa.Date(), nullable=False),
        sa.Column('guest_gender', gender_enum, nullable=False),
        sa.Column('guest_nationality', sa.String(length=100), nullable=False),
        # Contact person (for anonymous requests)
        sa.Column('contact_person', sa.String(length=255), nullable=True),
        # Guest type
        sa.Column('guest_type', guesttype_enum, nullable=False),
        sa.Column('guest_type_details', postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default='{}'),
        # Additional info
        sa.Column('additional_comments', sa.Text(), nullable=True),
        # Status
        sa.Column('status', guestrequeststatus_enum, nullable=False, server_default='pending'),
        # Admin fields
        sa.Column('reviewed_by', sa.String(length=255), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        # External references
        sa.Column('jira_ticket_key', sa.String(length=50), nullable=True),
        # TUM account info
        sa.Column('tum_id', sa.String(length=50), nullable=True),
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tum_guest_requests_requester_id'), 'tum_guest_requests', ['requester_id'], unique=False)
    op.create_index(op.f('ix_tum_guest_requests_guest_email'), 'tum_guest_requests', ['guest_email'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_tum_guest_requests_guest_email'), table_name='tum_guest_requests')
    op.drop_index(op.f('ix_tum_guest_requests_requester_id'), table_name='tum_guest_requests')
    op.drop_table('tum_guest_requests')

    # Drop enum types
    op.execute('DROP TYPE IF EXISTS guestrequeststatus')
    op.execute('DROP TYPE IF EXISTS gender')
    op.execute('DROP TYPE IF EXISTS guesttype')

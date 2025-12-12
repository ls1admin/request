"""add_requester_name_column

Revision ID: a1b2c3d4e5f6
Revises: fcad15d0cf82
Create Date: 2025-12-18 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'fcad15d0cf82'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add requester_name column to vm_requests table
    op.add_column(
        'vm_requests',
        sa.Column('requester_name', sa.String(length=255), nullable=True)
    )

    # Add requester_name column to vm_access_requests table
    op.add_column(
        'vm_access_requests',
        sa.Column('requester_name', sa.String(length=255), nullable=True)
    )


def downgrade() -> None:
    # Remove requester_name column from vm_access_requests table
    op.drop_column('vm_access_requests', 'requester_name')

    # Remove requester_name column from vm_requests table
    op.drop_column('vm_requests', 'requester_name')

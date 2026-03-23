"""add request_more_info to applicationstatus enum

Revision ID: b967d064853b
Revises: 57ab3c1f1bc8
Create Date: 2026-03-23 01:13:35.780165

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b967d064853b'
down_revision: Union[str, None] = '57ab3c1f1bc8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE applicationstatus ADD VALUE IF NOT EXISTS 'REQUEST_MORE_INFO' AFTER 'UNDER_REVIEW'")


def downgrade() -> None:
    pass  # Cannot remove enum values in PostgreSQL

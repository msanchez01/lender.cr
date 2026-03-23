"""add appraiser_id to appraisals and not_requested status

Revision ID: 79186f0da2fd
Revises: 9785e94f4506
Create Date: 2026-03-23 13:53:41.096255

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '79186f0da2fd'
down_revision: Union[str, None] = '9785e94f4506'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE appraisalstatus ADD VALUE IF NOT EXISTS 'NOT_REQUESTED' BEFORE 'ORDERED'")
    op.add_column('appraisals', sa.Column('appraiser_id', sa.UUID(), sa.ForeignKey('appraisers.id'), nullable=True))


def downgrade() -> None:
    op.drop_column('appraisals', 'appraiser_id')

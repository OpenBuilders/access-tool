"""stats table

Revision ID: 91c13c20e5ba
Revises: d6265f060ce8
Create Date: 2025-10-03 19:14:42.490498

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "91c13c20e5ba"
down_revision: Union[str, None] = "d6265f060ce8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "stats",
        sa.Column("data", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("timestamp", postgresql.TIMESTAMP(), nullable=False),
        sa.PrimaryKeyConstraint("timestamp"),
    )


def downgrade() -> None:
    op.drop_table("stats")

"""sticker character logo

Revision ID: 02d2e4791b2c
Revises: ae8e0ea77cf0
Create Date: 2025-04-29 10:54:21.198049

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "02d2e4791b2c"
down_revision: Union[str, None] = "ae8e0ea77cf0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "sticker_character", sa.Column("logo_url", sa.String(length=255), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("sticker_character", "logo_url")

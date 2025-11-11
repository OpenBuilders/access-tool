"""priced entity

Revision ID: 4ab8f7a4854a
Revises: 91c13c20e5ba
Create Date: 2025-10-25 12:57:04.098802

"""

from typing import Union
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4ab8f7a4854a"
down_revision: str | None = "91c13c20e5ba"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "gift_collection",
        sa.Column("price", sa.Numeric(precision=15, scale=6), nullable=True),
    )
    op.add_column(
        "jetton", sa.Column("price", sa.Numeric(precision=15, scale=6), nullable=True)
    )
    op.add_column(
        "nft_collection",
        sa.Column("price", sa.Numeric(precision=15, scale=6), nullable=True),
    )
    op.add_column(
        "sticker_character",
        sa.Column("price", sa.Numeric(precision=15, scale=6), nullable=True),
    )
    op.add_column(
        "sticker_collection",
        sa.Column("price", sa.Numeric(precision=15, scale=6), nullable=True),
    )
    op.add_column(
        "telegram_chat",
        sa.Column("price", sa.Numeric(precision=15, scale=6), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("telegram_chat", "price")
    op.drop_column("sticker_collection", "price")
    op.drop_column("sticker_character", "price")
    op.drop_column("nft_collection", "price")
    op.drop_column("jetton", "price")
    op.drop_column("gift_collection", "price")

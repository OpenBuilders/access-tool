"""offchain gift

Revision ID: 010fe4431b5f
Revises: f99d084537da
Create Date: 2025-05-29 14:47:08.958008

"""

from typing import Union
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "010fe4431b5f"
down_revision: str | None = "f99d084537da"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "gift_collection",
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("preview_url", sa.String(length=255), nullable=True),
        sa.Column("supply", sa.Integer(), nullable=False),
        sa.Column("upgraded_count", sa.Integer(), nullable=False),
        sa.Column("last_updated", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("slug"),
        sa.UniqueConstraint("title"),
    )
    op.create_table(
        "gift_unique",
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("collection_slug", sa.String(length=255), nullable=False),
        sa.Column("telegram_owner_id", sa.BigInteger(), nullable=True),
        sa.Column("number", sa.Integer(), nullable=False),
        sa.Column("blockchain_address", sa.String(length=255), nullable=True),
        sa.Column("owner_address", sa.String(length=255), nullable=True),
        sa.Column("model", sa.String(length=255), nullable=True),
        sa.Column("backdrop", sa.String(length=255), nullable=True),
        sa.Column("pattern", sa.String(length=255), nullable=True),
        sa.Column("last_updated", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["collection_slug"], ["gift_collection.slug"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("slug"),
    )
    op.create_index(
        op.f("ix_gift_unique_number"), "gift_unique", ["number"], unique=False
    )
    op.create_index(
        op.f("ix_gift_unique_owner_address"),
        "gift_unique",
        ["owner_address"],
        unique=False,
    )
    op.create_index(
        op.f("ix_gift_unique_telegram_owner_id"),
        "gift_unique",
        ["telegram_owner_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_gift_unique_telegram_owner_id"), table_name="gift_unique")
    op.drop_index(op.f("ix_gift_unique_owner_address"), table_name="gift_unique")
    op.drop_index(op.f("ix_gift_unique_number"), table_name="gift_unique")
    op.drop_table("gift_unique")
    op.drop_table("gift_collection")

"""telegram chat gift rule

Revision ID: fb5cffafd5eb
Revises: 010fe4431b5f
Create Date: 2025-05-29 18:36:40.572918

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "fb5cffafd5eb"
down_revision: Union[str, None] = "010fe4431b5f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "telegram_chat_gift_collection",
        sa.Column("collection_slug", sa.String(length=255), nullable=True),
        sa.Column("model", sa.String(length=255), nullable=True),
        sa.Column("backdrop", sa.String(length=255), nullable=True),
        sa.Column("pattern", sa.String(length=255), nullable=True),
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("chat_id", sa.BigInteger(), nullable=False),
        sa.Column("threshold", sa.BigInteger(), nullable=False),
        sa.Column("category", sa.String(length=255), nullable=True),
        sa.Column("grants_write_access", sa.Boolean(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["chat_id"], ["telegram_chat.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["collection_slug"], ["gift_collection.slug"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("telegram_chat_gift_collection")

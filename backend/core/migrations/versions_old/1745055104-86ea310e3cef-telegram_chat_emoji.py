"""telegram chat emoji

Revision ID: 86ea310e3cef
Revises: 0344e26d9740
Create Date: 2025-04-19 09:31:44.850736

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "86ea310e3cef"
down_revision: Union[str, None] = "0344e26d9740"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "telegram_chat_emoji",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("chat_id", sa.BigInteger(), nullable=False),
        sa.Column("emoji_id", sa.String(length=255), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["chat_id"], ["telegram_chat.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("chat_id", name="uix_chat_emoji_chat_id_unique"),
    )
    op.create_unique_constraint(
        "uix_chat_premium_chat_id_unique", "telegram_chat_premium", ["chat_id"]
    )


def downgrade() -> None:
    op.drop_constraint(
        "uix_chat_premium_chat_id_unique", "telegram_chat_premium", type_="unique"
    )
    op.drop_table("telegram_chat_emoji")

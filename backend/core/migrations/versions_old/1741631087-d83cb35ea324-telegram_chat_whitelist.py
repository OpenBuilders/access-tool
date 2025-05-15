"""telegram chat whitelist

Revision ID: d83cb35ea324
Revises: 722fd939c65d
Create Date: 2025-03-10 18:24:47.852602

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = "d83cb35ea324"
down_revision: Union[str, None] = "722fd939c65d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "telegram_chat_whitelist",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("chat_id", sa.BigInteger(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("is_enabled", sa.Boolean(), nullable=False),
        sa.Column("content", mysql.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["chat_id"],
            ["telegram_chat.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "chat_id", "name", name="uix_chat_whitelist_chat_name_unique"
        ),
    )
    op.create_table(
        "telegram_chat_whitelist_external_source",
        sa.Column("url", sa.String(length=255), nullable=False),
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("chat_id", sa.BigInteger(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("is_enabled", sa.Boolean(), nullable=False),
        sa.Column("content", mysql.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["chat_id"],
            ["telegram_chat.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "chat_id", "name", name="uix_chat_external_source_chat_name_unique"
        ),
    )
    op.drop_column("telegram_chat_user", "is_whale_admin")


def downgrade() -> None:
    op.add_column(
        "telegram_chat_user",
        sa.Column(
            "is_whale_admin",
            mysql.TINYINT(display_width=1),
            autoincrement=False,
            nullable=False,
        ),
    )
    op.drop_table("telegram_chat_whitelist_external_source")
    op.drop_table("telegram_chat_whitelist")

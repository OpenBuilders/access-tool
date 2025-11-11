"""index telegram chat user

Revision ID: 3abd43626972
Revises: 4ab8f7a4854a
Create Date: 2025-10-26 14:55:16.282447

"""

from typing import Union
from collections.abc import Sequence

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "3abd43626972"
down_revision: str | None = "4ab8f7a4854a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        op.f("ix_telegram_chat_user_is_managed"),
        "telegram_chat_user",
        ["is_managed"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_telegram_chat_user_is_managed"), table_name="telegram_chat_user"
    )

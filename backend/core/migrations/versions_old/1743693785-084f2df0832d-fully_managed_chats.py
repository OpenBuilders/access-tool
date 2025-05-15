"""fully managed chats

Revision ID: 084f2df0832d
Revises: 0aa019ac2275
Create Date: 2025-04-03 15:23:05.965008

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "084f2df0832d"
down_revision: Union[str, None] = "0aa019ac2275"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "telegram_chat", sa.Column("is_full_control", sa.Boolean(), nullable=False)
    )
    op.add_column(
        "telegram_chat_user",
        sa.Column("is_managed", sa.Boolean(), nullable=False, server_default="1"),
    )


def downgrade() -> None:
    op.drop_column("telegram_chat_user", "is_managed")
    op.drop_column("telegram_chat", "is_full_control")

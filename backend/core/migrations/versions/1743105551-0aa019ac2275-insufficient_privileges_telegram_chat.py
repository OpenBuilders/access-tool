"""insufficient privileges telegram chat

Revision ID: 0aa019ac2275
Revises: dd0f12e3d396
Create Date: 2025-03-27 19:59:11.451235

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0aa019ac2275"
down_revision: Union[str, None] = "dd0f12e3d396"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "telegram_chat",
        sa.Column("insufficient_privileges", sa.Boolean(), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("telegram_chat", "insufficient_privileges")

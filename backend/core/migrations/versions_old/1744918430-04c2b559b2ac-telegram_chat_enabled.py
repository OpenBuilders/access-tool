"""telegram chat enabled

Revision ID: 04c2b559b2ac
Revises: 4c9cad4be73b
Create Date: 2025-04-17 19:33:50.212461

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "04c2b559b2ac"
down_revision: Union[str, None] = "4c9cad4be73b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "telegram_chat",
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default="1"),
    )


def downgrade() -> None:
    op.drop_column("telegram_chat", "is_enabled")

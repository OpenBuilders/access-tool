"""telegram chat description

Revision ID: 3db83ba500ef
Revises: 9d49e763cf83
Create Date: 2025-02-21 22:48:28.316828

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3db83ba500ef"
down_revision: Union[str, None] = "9d49e763cf83"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "telegram_chat", sa.Column("description", sa.String(length=255), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("telegram_chat", "description")

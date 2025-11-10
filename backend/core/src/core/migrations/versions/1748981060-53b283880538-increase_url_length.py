"""increase url length

Revision ID: 53b283880538
Revises: fb5cffafd5eb
Create Date: 2025-06-03 20:04:20.189989

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "53b283880538"
down_revision: Union[str, None] = "fb5cffafd5eb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "telegram_chat_whitelist_external_source",
        "url",
        existing_type=sa.VARCHAR(length=255),
        type_=sa.String(length=2000),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "telegram_chat_whitelist_external_source",
        "url",
        existing_type=sa.String(length=2000),
        type_=sa.VARCHAR(length=255),
        existing_nullable=False,
    )

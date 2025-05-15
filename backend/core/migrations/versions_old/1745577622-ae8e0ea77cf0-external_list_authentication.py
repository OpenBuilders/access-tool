"""external list authentication

Revision ID: ae8e0ea77cf0
Revises: 86ea310e3cef
Create Date: 2025-04-25 10:40:22.152567

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ae8e0ea77cf0"
down_revision: Union[str, None] = "86ea310e3cef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "telegram_chat_whitelist_external_source",
        sa.Column("auth_key", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "telegram_chat_whitelist_external_source",
        sa.Column("auth_value", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("telegram_chat_whitelist_external_source", "auth_value")
    op.drop_column("telegram_chat_whitelist_external_source", "auth_key")

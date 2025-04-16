"""whitelist cascade

Revision ID: 64343b63fb7e
Revises: c8b12640b88f
Create Date: 2025-03-25 14:57:55.796341

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "64343b63fb7e"
down_revision: Union[str, None] = "c8b12640b88f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint(
        "telegram_chat_whitelist_ibfk_1", "telegram_chat_whitelist", type_="foreignkey"
    )
    op.create_foreign_key(
        None,
        "telegram_chat_whitelist",
        "telegram_chat",
        ["chat_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.drop_constraint(
        "telegram_chat_whitelist_external_source_ibfk_1",
        "telegram_chat_whitelist_external_source",
        type_="foreignkey",
    )
    op.create_foreign_key(
        None,
        "telegram_chat_whitelist_external_source",
        "telegram_chat",
        ["chat_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint(
        None, "telegram_chat_whitelist_external_source", type_="foreignkey"
    )
    op.create_foreign_key(
        "telegram_chat_whitelist_external_source_ibfk_1",
        "telegram_chat_whitelist_external_source",
        "telegram_chat",
        ["chat_id"],
        ["id"],
    )
    op.drop_constraint(None, "telegram_chat_whitelist", type_="foreignkey")
    op.create_foreign_key(
        "telegram_chat_whitelist_ibfk_1",
        "telegram_chat_whitelist",
        "telegram_chat",
        ["chat_id"],
        ["id"],
    )

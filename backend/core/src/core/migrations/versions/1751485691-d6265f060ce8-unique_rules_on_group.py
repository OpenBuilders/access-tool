"""unique rules on group

Revision ID: d6265f060ce8
Revises: e42ccafc55f5
Create Date: 2025-07-02 19:48:11.036375

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "d6265f060ce8"
down_revision: Union[str, None] = "e42ccafc55f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint(
        "uix_chat_emoji_chat_id_unique", "telegram_chat_emoji", type_="unique"
    )
    op.create_unique_constraint(
        "uix_chat_emoji_group_id_unique", "telegram_chat_emoji", ["group_id"]
    )
    op.drop_constraint(
        "uix_chat_premium_chat_id_unique", "telegram_chat_premium", type_="unique"
    )
    op.create_unique_constraint(
        "uix_chat_premium_group_id_unique", "telegram_chat_premium", ["group_id"]
    )
    op.drop_constraint(
        "uix_chat_whitelist_chat_name_unique", "telegram_chat_whitelist", type_="unique"
    )
    op.create_unique_constraint(
        "uix_chat_whitelist_group_name_unique",
        "telegram_chat_whitelist",
        ["group_id", "name"],
    )
    op.drop_constraint(
        "uix_chat_external_source_chat_name_unique",
        "telegram_chat_whitelist_external_source",
        type_="unique",
    )
    op.create_unique_constraint(
        "uix_chat_external_source_chat_group_unique",
        "telegram_chat_whitelist_external_source",
        ["group_id", "name"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uix_chat_external_source_chat_group_unique",
        "telegram_chat_whitelist_external_source",
        type_="unique",
    )
    op.create_unique_constraint(
        "uix_chat_external_source_chat_name_unique",
        "telegram_chat_whitelist_external_source",
        ["chat_id", "name"],
        postgresql_nulls_not_distinct=False,
    )
    op.drop_constraint(
        "uix_chat_whitelist_group_name_unique",
        "telegram_chat_whitelist",
        type_="unique",
    )
    op.create_unique_constraint(
        "uix_chat_whitelist_chat_name_unique",
        "telegram_chat_whitelist",
        ["chat_id", "name"],
        postgresql_nulls_not_distinct=False,
    )
    op.drop_constraint(
        "uix_chat_premium_group_id_unique", "telegram_chat_premium", type_="unique"
    )
    op.create_unique_constraint(
        "uix_chat_premium_chat_id_unique",
        "telegram_chat_premium",
        ["chat_id"],
        postgresql_nulls_not_distinct=False,
    )
    op.drop_constraint(
        "uix_chat_emoji_group_id_unique", "telegram_chat_emoji", type_="unique"
    )
    op.create_unique_constraint(
        "uix_chat_emoji_chat_id_unique",
        "telegram_chat_emoji",
        ["chat_id"],
        postgresql_nulls_not_distinct=False,
    )

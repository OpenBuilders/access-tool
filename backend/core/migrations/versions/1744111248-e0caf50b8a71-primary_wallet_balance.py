"""primary wallet balance

Revision ID: e0caf50b8a71
Revises: 049e9ef547b2
Create Date: 2025-04-08 11:20:48.867603

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = "e0caf50b8a71"
down_revision: Union[str, None] = "049e9ef547b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint(
        "telegram_chat_user_wallet_ibfk_2",
        "telegram_chat_user_wallet",
        type_="foreignkey",
    )
    op.drop_constraint(
        "telegram_chat_user_wallet_ibfk_3",
        "telegram_chat_user_wallet",
        type_="foreignkey",
    )
    op.drop_constraint(
        "telegram_chat_user_wallet_ibfk_1",
        "telegram_chat_user_wallet",
        type_="foreignkey",
    )
    op.create_foreign_key(
        None,
        "telegram_chat_user_wallet",
        "user_wallet",
        ["address"],
        ["address"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "telegram_chat_user_wallet",
        "telegram_chat",
        ["chat_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "telegram_chat_user_wallet",
        "user",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.add_column("user_wallet", sa.Column("balance", mysql.BIGINT(), nullable=True))


def downgrade() -> None:
    op.drop_column("user_wallet", "balance")
    op.drop_constraint(None, "telegram_chat_user_wallet", type_="foreignkey")
    op.drop_constraint(None, "telegram_chat_user_wallet", type_="foreignkey")
    op.drop_constraint(None, "telegram_chat_user_wallet", type_="foreignkey")
    op.create_foreign_key(
        "telegram_chat_user_wallet_ibfk_1",
        "telegram_chat_user_wallet",
        "user_wallet",
        ["address"],
        ["address"],
    )
    op.create_foreign_key(
        "telegram_chat_user_wallet_ibfk_3",
        "telegram_chat_user_wallet",
        "user",
        ["user_id"],
        ["id"],
    )
    op.create_foreign_key(
        "telegram_chat_user_wallet_ibfk_2",
        "telegram_chat_user_wallet",
        "telegram_chat",
        ["chat_id"],
        ["id"],
    )

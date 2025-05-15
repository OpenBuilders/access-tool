"""telegram chat wallet link

Revision ID: 049e9ef547b2
Revises: 21490b140b9f
Create Date: 2025-04-05 12:51:22.143477

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = "049e9ef547b2"
down_revision: Union[str, None] = "21490b140b9f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def migrate_data() -> None:
    # Create records in telegram_chat_user_wallet for each telegram_chat_user and user_wallet
    connection = op.get_bind()
    result = connection.execute(
        sa.text(
            """
            INSERT INTO telegram_chat_user_wallet (user_id, chat_id, address)
            SELECT DISTINCT
                tcu.user_id,
                tcu.chat_id,
                uw.address
            FROM
                telegram_chat_user AS tcu
            JOIN
                user_wallet AS uw
            ON
                tcu.user_id = uw.user_id
            """
        )
    )
    print(f"Inserted {result.rowcount} records into telegram_chat_user_wallet.")


def upgrade() -> None:
    op.create_table(
        "telegram_chat_user_wallet",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("chat_id", sa.BigInteger(), nullable=False),
        sa.Column("address", sa.String(length=67), nullable=False),
        sa.ForeignKeyConstraint(
            ["address"],
            ["user_wallet.address"],
        ),
        sa.ForeignKeyConstraint(
            ["chat_id"],
            ["telegram_chat.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("chat_id", "address"),
    )
    migrate_data()
    # Remove unique constraint from user_id only and apply it to user_id, address pair
    op.drop_constraint("user_wallet_ibfk_1", "user_wallet", type_="foreignkey")
    op.drop_index("user_id", table_name="user_wallet")
    op.create_foreign_key(
        "user_wallet_ibfk_1", "user_wallet", "user", ["user_id"], ["id"]
    )
    op.create_unique_constraint(
        "uq_wallet_address_user_id", "user_wallet", ["address", "user_id"]
    )

    op.drop_column("user_wallet", "updated_at")


def downgrade() -> None:
    op.add_column(
        "user_wallet",
        sa.Column(
            "updated_at",
            mysql.DATETIME(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    # Apply unique constraint to the user_id column only as it was before
    op.drop_constraint("user_wallet_ibfk_1", "user_wallet", type_="foreignkey")
    op.drop_constraint("uq_wallet_address_user_id", "user_wallet", type_="unique")
    op.create_index("user_id", "user_wallet", ["user_id"], unique=True)
    op.create_foreign_key(
        "user_wallet_ibfk_1", "user_wallet", "user", ["user_id"], ["id"]
    )

    op.drop_table("telegram_chat_user_wallet")

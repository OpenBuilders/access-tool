"""asset and category for rules

Revision ID: 3b2c6725822a
Revises: adab1862aaf3
Create Date: 2025-04-10 16:45:03.882844

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = "3b2c6725822a"
down_revision: Union[str, None] = "adab1862aaf3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def migrate_data():
    op.execute(sa.text("""UPDATE telegram_chat_jetton SET category = 'Balance'"""))
    op.execute(sa.text("""UPDATE telegram_chat_toncoin SET category = 'Balance'"""))


def upgrade() -> None:
    op.add_column(
        "telegram_chat_jetton",
        sa.Column("category", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "telegram_chat_nft_collection",
        sa.Column("asset", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "telegram_chat_nft_collection",
        sa.Column("category", sa.String(length=255), nullable=True),
    )
    op.alter_column(
        "telegram_chat_nft_collection",
        "address",
        existing_type=mysql.VARCHAR(length=67),
        nullable=True,
    )
    op.drop_column("telegram_chat_nft_collection", "required_attributes")
    op.add_column(
        "telegram_chat_toncoin",
        sa.Column("category", sa.String(length=255), nullable=True),
    )
    migrate_data()


def downgrade() -> None:
    op.drop_column("telegram_chat_toncoin", "category")
    op.add_column(
        "telegram_chat_nft_collection",
        sa.Column("required_attributes", mysql.JSON(), nullable=True),
    )
    op.alter_column(
        "telegram_chat_nft_collection",
        "address",
        existing_type=mysql.VARCHAR(length=67),
        nullable=False,
    )
    op.drop_column("telegram_chat_nft_collection", "category")
    op.drop_column("telegram_chat_nft_collection", "asset")
    op.drop_column("telegram_chat_jetton", "category")

"""telegram chat nft collection rule

Revision ID: cc23f00e5caa
Revises: 3db83ba500ef
Create Date: 2025-03-06 20:09:40.894631

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = "cc23f00e5caa"
down_revision: Union[str, None] = "3db83ba500ef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _copy_data_from_one_column_to_another(
    table_name: str, old_column_name: str, new_column_name: str
) -> None:
    op.execute(
        f"""
        UPDATE {table_name}
        SET {new_column_name} = {old_column_name}
        """
    )


def upgrade() -> None:
    # Jetton
    # Create new columns
    op.add_column(
        "telegram_chat_jetton",
        sa.Column("address", sa.String(length=67), nullable=False),
    )
    # Copy data from old column to new column
    _copy_data_from_one_column_to_another(
        "telegram_chat_jetton", "jetton_address", "address"
    )
    # Recreate the foreign key constraint
    op.drop_constraint(
        "telegram_chat_jetton_ibfk_2", "telegram_chat_jetton", type_="foreignkey"
    )
    op.create_foreign_key(
        "telegram_chat_jetton_ibfk_3",
        "telegram_chat_jetton",
        "jetton",
        ["address"],
        ["address"],
        ondelete="CASCADE",
    )
    # Recreate the primary key constraint
    op.drop_constraint(
        "telegram_chat_jetton_pkey", "telegram_chat_jetton", type_="primary"
    )
    op.create_primary_key(
        "telegram_chat_jetton_pkey", "telegram_chat_jetton", ["chat_id", "address"]
    )
    # Drop old columns
    op.drop_column("telegram_chat_jetton", "jetton_address")
    op.drop_column("telegram_chat_jetton", "whale_label_template")
    op.drop_column("telegram_chat_jetton", "whale_threshold")

    # NFT Collection
    # Create new columns
    op.add_column(
        "telegram_chat_nft_collection",
        sa.Column("address", sa.String(length=67), nullable=False),
    )
    op.add_column(
        "telegram_chat_nft_collection",
        sa.Column("threshold", sa.BigInteger(), nullable=False),
    )
    # Copy data from old column to new column
    _copy_data_from_one_column_to_another(
        "telegram_chat_nft_collection", "collection_address", "address"
    )
    # Recreate the foreign key constraint
    op.drop_constraint(
        "telegram_chat_nft_collection_ibfk_2",
        "telegram_chat_nft_collection",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "telegram_chat_nft_collection_ibfk_3",
        "telegram_chat_nft_collection",
        "nft_collection",
        ["address"],
        ["address"],
        ondelete="CASCADE",
    )
    # Recreate the primary key constraint
    op.drop_constraint(
        "telegram_chat_nft_collection_pkey",
        "telegram_chat_nft_collection",
        type_="primary",
    )
    op.create_primary_key(
        "telegram_chat_nft_collection_pkey",
        "telegram_chat_nft_collection",
        ["chat_id", "address"],
    )
    # Drop old columns
    op.drop_column("telegram_chat_nft_collection", "collection_address")


def downgrade() -> None:
    # Jetton
    # Create new columns
    op.add_column(
        "telegram_chat_jetton",
        sa.Column("jetton_address", mysql.VARCHAR(length=67), nullable=False),
    )
    op.add_column(
        "telegram_chat_jetton",
        sa.Column("whale_threshold", mysql.BIGINT(), nullable=True),
    )
    op.add_column(
        "telegram_chat_jetton",
        sa.Column("whale_label_template", mysql.VARCHAR(length=25), nullable=True),
    )
    # Copy data from old column to new column
    _copy_data_from_one_column_to_another(
        "telegram_chat_jetton", "address", "jetton_address"
    )
    # Recreate the foreign key constraint
    op.drop_constraint(
        "telegram_chat_jetton_ibfk_3", "telegram_chat_jetton", type_="foreignkey"
    )
    op.create_foreign_key(
        "telegram_chat_jetton_ibfk_2",
        "telegram_chat_jetton",
        "jetton",
        ["jetton_address"],
        ["address"],
        ondelete="CASCADE",
    )
    # Recreate the primary key constraint
    op.drop_constraint(
        "telegram_chat_jetton_pkey", "telegram_chat_jetton", type_="primary"
    )
    op.create_primary_key(
        "telegram_chat_jetton_pkey",
        "telegram_chat_jetton",
        ["chat_id", "jetton_address"],
    )
    # Drop old columns
    op.drop_column("telegram_chat_jetton", "address")

    # NFT Collection
    # Create new columns
    op.add_column(
        "telegram_chat_nft_collection",
        sa.Column("collection_address", mysql.VARCHAR(length=67), nullable=False),
    )
    # Copy data from old column to new column
    _copy_data_from_one_column_to_another(
        "telegram_chat_nft_collection", "address", "collection_address"
    )
    # Recreate the foreign key constraint
    op.drop_constraint(
        "telegram_chat_nft_collection_ibfk_3",
        "telegram_chat_nft_collection",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "telegram_chat_nft_collection_ibfk_2",
        "telegram_chat_nft_collection",
        "nft_collection",
        ["collection_address"],
        ["address"],
        ondelete="CASCADE",
    )
    # Recreate the primary key constraint
    op.drop_constraint(
        "telegram_chat_nft_collection_pkey",
        "telegram_chat_nft_collection",
        type_="primary",
    )
    op.create_primary_key(
        "telegram_chat_nft_collection_pkey",
        "telegram_chat_nft_collection",
        ["chat_id", "collection_address"],
    )
    # Drop old columns
    op.drop_column("telegram_chat_nft_collection", "address")
    op.drop_column("telegram_chat_nft_collection", "threshold")

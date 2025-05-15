"""telegram chat rule id

Revision ID: 722fd939c65d
Revises: cc23f00e5caa
Create Date: 2025-03-07 11:29:24.001188

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "722fd939c65d"
down_revision: Union[str, None] = "cc23f00e5caa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the foreign key constraints
    op.drop_constraint(
        "telegram_chat_jetton_ibfk_1", "telegram_chat_jetton", type_="foreignkey"
    )
    op.drop_constraint(
        "telegram_chat_jetton_ibfk_3", "telegram_chat_jetton", type_="foreignkey"
    )

    # Drop the primary key
    op.drop_constraint(
        "telegram_chat_jetton_pkey", "telegram_chat_jetton", type_="primary"
    )

    # Add the new columns
    op.add_column("telegram_chat_jetton", sa.Column("id", sa.Integer(), nullable=False))
    op.add_column(
        "telegram_chat_jetton",
        sa.Column("grants_write_access", sa.Boolean(), nullable=False),
    )

    # Create the new primary key
    op.execute(
        "ALTER TABLE telegram_chat_jetton MODIFY COLUMN id INT AUTO_INCREMENT NOT NULL PRIMARY KEY"
    )

    # Recreate the foreign key constraints
    op.create_foreign_key(
        "telegram_chat_jetton_ibfk_1",
        "telegram_chat_jetton",
        "telegram_chat",
        ["chat_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "telegram_chat_jetton_ibfk_3",
        "telegram_chat_jetton",
        "jetton",
        ["address"],
        ["address"],
        ondelete="CASCADE",
    )

    # Drop the foreign key constraints for telegram_chat_nft_collection
    op.drop_constraint(
        "telegram_chat_nft_collection_ibfk_1",
        "telegram_chat_nft_collection",
        type_="foreignkey",
    )
    op.drop_constraint(
        "telegram_chat_nft_collection_ibfk_3",
        "telegram_chat_nft_collection",
        type_="foreignkey",
    )

    # Drop the primary key for telegram_chat_nft_collection
    op.drop_constraint(
        "telegram_chat_nft_collection_pkey",
        "telegram_chat_nft_collection",
        type_="primary",
    )

    # Add the new columns for telegram_chat_nft_collection
    op.add_column(
        "telegram_chat_nft_collection", sa.Column("id", sa.Integer(), nullable=False)
    )
    op.add_column(
        "telegram_chat_nft_collection",
        sa.Column("grants_write_access", sa.Boolean(), nullable=False),
    )

    # Create the new primary key for telegram_chat_nft_collection
    op.execute(
        "ALTER TABLE telegram_chat_nft_collection MODIFY COLUMN id INT AUTO_INCREMENT NOT NULL PRIMARY KEY"
    )

    # Recreate the foreign key constraints for telegram_chat_nft_collection
    op.create_foreign_key(
        "telegram_chat_nft_collection_ibfk_1",
        "telegram_chat_nft_collection",
        "telegram_chat",
        ["chat_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "telegram_chat_nft_collection_ibfk_3",
        "telegram_chat_nft_collection",
        "nft_collection",
        ["address"],
        ["address"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    # Drop the primary key for telegram_chat_jetton
    op.execute("ALTER TABLE telegram_chat_jetton MODIFY COLUMN id INT NOT NULL")
    op.drop_constraint(
        "telegram_chat_jetton_pkey", "telegram_chat_jetton", type_="primary"
    )
    op.create_primary_key(
        "telegram_chat_jetton_pkey", "telegram_chat_jetton", ["chat_id", "address"]
    )

    # Drop the new columns for telegram_chat_jetton
    op.drop_column("telegram_chat_jetton", "grants_write_access")
    op.drop_column("telegram_chat_jetton", "id")

    # Recreate the foreign key constraints for telegram_chat_jetton
    op.drop_constraint(
        "telegram_chat_jetton_ibfk_1", "telegram_chat_jetton", type_="foreignkey"
    )
    op.drop_constraint(
        "telegram_chat_jetton_ibfk_3", "telegram_chat_jetton", type_="foreignkey"
    )
    op.create_foreign_key(
        "telegram_chat_jetton_ibfk_1",
        "telegram_chat_jetton",
        "telegram_chat",
        ["chat_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "telegram_chat_jetton_ibfk_3",
        "telegram_chat_jetton",
        "jetton",
        ["address"],
        ["address"],
        ondelete="CASCADE",
    )

    # Drop the primary key for telegram_chat_nft_collection
    op.execute("ALTER TABLE telegram_chat_nft_collection MODIFY COLUMN id INT NOT NULL")
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

    # Drop the new columns for telegram_chat_nft_collection
    op.drop_column("telegram_chat_nft_collection", "grants_write_access")
    op.drop_column("telegram_chat_nft_collection", "id")

    # Recreate the foreign key constraints for telegram_chat_nft_collection
    op.drop_constraint(
        "telegram_chat_nft_collection_ibfk_1",
        "telegram_chat_nft_collection",
        type_="foreignkey",
    )
    op.drop_constraint(
        "telegram_chat_nft_collection_ibfk_3",
        "telegram_chat_nft_collection",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "telegram_chat_nft_collection_ibfk_1",
        "telegram_chat_nft_collection",
        "telegram_chat",
        ["chat_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "telegram_chat_nft_collection_ibfk_3",
        "telegram_chat_nft_collection",
        "nft_collection",
        ["address"],
        ["address"],
        ondelete="CASCADE",
    )

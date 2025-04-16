"""nft collection metadata

Revision ID: c8b12640b88f
Revises: d83cb35ea324
Create Date: 2025-03-12 16:06:38.666597

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = "c8b12640b88f"
down_revision: Union[str, None] = "d83cb35ea324"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "nft_collection", sa.Column("blockchain_metadata", mysql.JSON(), nullable=True)
    )
    op.add_column(
        "nft_item", sa.Column("blockchain_metadata", mysql.JSON(), nullable=True)
    )
    op.add_column(
        "telegram_chat_nft_collection",
        sa.Column("required_attributes", mysql.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("telegram_chat_nft_collection", "required_attributes")
    op.drop_column("nft_item", "blockchain_metadata")
    op.drop_column("nft_collection", "blockchain_metadata")

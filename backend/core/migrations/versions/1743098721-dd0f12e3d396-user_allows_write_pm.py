"""user allows write pm

Revision ID: dd0f12e3d396
Revises: 64343b63fb7e
Create Date: 2025-03-27 18:05:21.987426

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "dd0f12e3d396"
down_revision: Union[str, None] = "64343b63fb7e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user",
        sa.Column(
            "allows_write_to_pm", sa.Boolean(), server_default="1", nullable=False
        ),
    )


def downgrade() -> None:
    op.drop_column("user", "allows_write_to_pm")

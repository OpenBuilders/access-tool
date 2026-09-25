"""merge heads

Revision ID: 1c826351ffe6
Revises: abd20b1dfcfb, 105b4511d5ca
Create Date: 2026-06-03 19:30:16.699890

"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "1c826351ffe6"
down_revision: Union[str, None] = ("abd20b1dfcfb", "105b4511d5ca")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

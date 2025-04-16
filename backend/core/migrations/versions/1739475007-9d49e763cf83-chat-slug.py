"""

Revision ID: 9d49e763cf83
Revises: 3285a761c4fd
Create Date: 2025-02-13 19:30:07.851410

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9d49e763cf83"
down_revision: Union[str, None] = "3285a761c4fd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "telegram_chat", sa.Column("slug", sa.String(length=255), nullable=False)
    )
    # Generate slugs from titles
    connection = op.get_bind()
    result = connection.execute(sa.text("SELECT id, title FROM telegram_chat"))
    for row in result:
        slug = row[1].replace(" ", "-").lower()
        connection.execute(
            sa.text("UPDATE telegram_chat SET slug = :slug WHERE id = :id"),
            {"slug": slug, "id": row[0]},
        )
    op.create_unique_constraint(None, "telegram_chat", ["slug"])


def downgrade() -> None:
    op.drop_constraint(None, "telegram_chat", type_="unique")
    op.drop_column("telegram_chat", "slug")

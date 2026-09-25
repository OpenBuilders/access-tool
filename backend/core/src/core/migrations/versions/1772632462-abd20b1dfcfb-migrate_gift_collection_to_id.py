"""migrate_gift_collection_to_id

Revision ID: abd20b1dfcfb
Revises: 6c6b45ffe090
Create Date: 2026-03-04 13:54:22.662223

"""
from typing import Sequence, Union
import json
from pathlib import Path

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "abd20b1dfcfb"
down_revision: Union[str, None] = "6c6b45ffe090"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

GIFT_COLLECTION_IDS_MAPPING_PATH = (
    Path(__file__).parent / "../data/gift-collection-ids-to-names.json"
)


def upgrade_schema() -> None:
    # 1. Add new columns
    op.add_column(
        "gift_collection",
        sa.Column("id", sa.BigInteger(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "gift_collection",
        sa.Column("blockchain_address", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "gift_collection",
        sa.Column("options", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )

    op.add_column(
        "gift_unique", sa.Column("collection_id", sa.BigInteger(), nullable=True)
    )
    op.add_column(
        "telegram_chat_gift_collection",
        sa.Column("collection_id", sa.BigInteger(), nullable=True),
    )

    # 2. Drop foreign keys referencing `gift_collection.slug`
    op.drop_constraint(
        "gift_unique_collection_slug_fkey", "gift_unique", type_="foreignkey"
    )
    op.drop_constraint(
        "telegram_chat_gift_collection_collection_slug_fkey",
        "telegram_chat_gift_collection",
        type_="foreignkey",
    )


def migrate_data_upgrade() -> None:
    # 3. Data Migration
    with open(GIFT_COLLECTION_IDS_MAPPING_PATH, "r") as f:
        mapping = json.load(f)

    connection = op.get_bind()
    for col_id, name in mapping.items():
        connection.execute(
            sa.text(
                'UPDATE gift_collection SET id = :id, options = \'{"models": [], "backdrops": [], "patterns": []}\'::jsonb WHERE title = :name'
            ),
            {"id": int(col_id), "name": name},
        )

    # Update new fields in referencing tables
    connection.execute(
        sa.text(
            "UPDATE gift_unique SET collection_id = gc.id FROM gift_collection gc WHERE gift_unique.collection_slug = gc.slug"
        )
    )
    connection.execute(
        sa.text(
            "UPDATE telegram_chat_gift_collection SET collection_id = gc.id FROM gift_collection gc WHERE telegram_chat_gift_collection.collection_slug = gc.slug"
        )
    )


def cleanup_schema_upgrade() -> None:
    connection = op.get_bind()
    # Delete unmapped collections and their relations
    connection.execute(
        sa.text(
            "DELETE FROM gift_unique WHERE collection_slug IN (SELECT slug FROM gift_collection WHERE id IS NULL)"
        )
    )
    connection.execute(
        sa.text(
            "DELETE FROM telegram_chat_gift_collection WHERE collection_slug IN (SELECT slug FROM gift_collection WHERE id IS NULL)"
        )
    )
    connection.execute(sa.text("DELETE FROM gift_collection WHERE id IS NULL"))

    # 4. Remove old PK & slug columns
    op.drop_constraint("gift_collection_pkey", "gift_collection", type_="primary")
    op.drop_column("gift_collection", "slug")
    op.drop_column("gift_unique", "collection_slug")
    op.drop_column("telegram_chat_gift_collection", "collection_slug")

    # 5. Alter columns non-nullable where needed
    op.alter_column("gift_collection", "id", nullable=False)
    op.alter_column("gift_collection", "options", nullable=False)
    op.alter_column("gift_unique", "collection_id", nullable=False)

    # 6. Add new PK and foreign keys
    op.create_primary_key("gift_collection_pkey", "gift_collection", ["id"])

    op.create_foreign_key(
        "gift_unique_collection_id_fkey",
        "gift_unique",
        "gift_collection",
        ["collection_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "telegram_chat_gift_collection_collection_id_fkey",
        "telegram_chat_gift_collection",
        "gift_collection",
        ["collection_id"],
        ["id"],
        ondelete="CASCADE",
    )


BACKUP_TABLES = [
    ("gift_collection", "_backup_gift_collection"),
    ("gift_unique", "_backup_gift_unique"),
    ("telegram_chat_gift_collection", "_backup_telegram_chat_gift_collection"),
]


def backup_tables() -> None:
    connection = op.get_bind()
    for source, backup in BACKUP_TABLES:
        connection.execute(sa.text(f"DROP TABLE IF EXISTS {backup}"))
        connection.execute(sa.text(f"CREATE TABLE {backup} AS SELECT * FROM {source}"))


def drop_backup_tables() -> None:
    connection = op.get_bind()
    for _, backup in BACKUP_TABLES:
        connection.execute(sa.text(f"DROP TABLE IF EXISTS {backup}"))


def upgrade() -> None:
    backup_tables()
    upgrade_schema()
    migrate_data_upgrade()
    cleanup_schema_upgrade()


def downgrade_schema() -> None:
    # 1. Add back columns
    op.add_column(
        "telegram_chat_gift_collection",
        sa.Column(
            "collection_slug",
            sa.VARCHAR(length=255),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "gift_unique",
        sa.Column(
            "collection_slug",
            sa.VARCHAR(length=255),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "gift_collection",
        sa.Column("slug", sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    )

    # 2. Drop FKs and new PK
    op.drop_constraint(
        "telegram_chat_gift_collection_collection_id_fkey",
        "telegram_chat_gift_collection",
        type_="foreignkey",
    )
    op.drop_constraint(
        "gift_unique_collection_id_fkey", "gift_unique", type_="foreignkey"
    )
    op.drop_constraint("gift_collection_pkey", "gift_collection", type_="primary")


def migrate_data_downgrade() -> None:
    # 3. Data migration
    connection = op.get_bind()
    connection.execute(
        sa.text("UPDATE gift_collection SET slug = REPLACE(LOWER(title), ' ', '-')")
    )

    connection.execute(
        sa.text(
            "UPDATE gift_unique SET collection_slug = gc.slug FROM gift_collection gc WHERE gift_unique.collection_id = gc.id"
        )
    )
    connection.execute(
        sa.text(
            "UPDATE telegram_chat_gift_collection SET collection_slug = gc.slug FROM gift_collection gc WHERE telegram_chat_gift_collection.collection_id = gc.id"
        )
    )


def cleanup_schema_downgrade() -> None:
    op.alter_column("gift_collection", "slug", nullable=False)
    op.alter_column("gift_unique", "collection_slug", nullable=False)

    op.create_primary_key("gift_collection_pkey", "gift_collection", ["slug"])
    op.create_foreign_key(
        "telegram_chat_gift_collection_collection_slug_fkey",
        "telegram_chat_gift_collection",
        "gift_collection",
        ["collection_slug"],
        ["slug"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "gift_unique_collection_slug_fkey",
        "gift_unique",
        "gift_collection",
        ["collection_slug"],
        ["slug"],
        ondelete="CASCADE",
    )

    op.drop_column("telegram_chat_gift_collection", "collection_id")
    op.drop_column("gift_unique", "collection_id")
    op.drop_column("gift_collection", "id")
    op.drop_column("gift_collection", "blockchain_address")
    op.drop_column("gift_collection", "options")


def downgrade() -> None:
    downgrade_schema()
    migrate_data_downgrade()
    cleanup_schema_downgrade()
    drop_backup_tables()

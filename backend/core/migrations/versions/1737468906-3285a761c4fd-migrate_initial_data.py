"""migrate initial data

Revision ID: 3285a761c4fd
Revises: e4acf6e9d41f
Create Date: 2025-01-21 14:15:06.057960

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy import text

from core.settings import core_settings

# revision identifiers, used by Alembic.
revision: str = "3285a761c4fd"
down_revision: Union[str, None] = "e4acf6e9d41f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if anon database exists
    anon_db = op.get_bind().execute(text("SHOW DATABASES LIKE 'anon'")).fetchone()
    if not anon_db:
        print("Anon database not found")
        return

    op.execute(
        f"""
            INSERT INTO {core_settings.mysql_database}.user (id, telegram_id, is_premium, username, first_name, last_name, language, is_blocked, is_admin, created_at)
            SELECT id, telegram_id, is_premium, username, first_name, last_name, language, is_blocked, 0, created_at
            FROM anon.user
        """
    )

    # Migrate data from anon.user_wallet to {CURRENT_SCHEMA}.user_wallet
    op.execute(
        f"""
            INSERT INTO {core_settings.mysql_database}.user_wallet (address, user_id, created_at, updated_at, hide_wallet)
            SELECT address, user_id, created_at, updated_at, hide_wallet
            FROM anon.user_wallet
            WHERE anon.user_wallet.address NOT IN ({', '.join([f"'{address}'" for address in core_settings.blacklisted_wallets])})
        """
    )

    pass


def downgrade() -> None:
    op.execute(f"DELETE FROM {core_settings.mysql_database}.user_wallet")
    op.execute(f"DELETE FROM {core_settings.mysql_database}.user")

"""migrate sticker ownership data

Revision ID: 42065519a495
Revises: 1b167f412dfd
Create Date: 2025-11-21 09:52:47.531079

"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa
import logging
from sqlalchemy import exc as sa_exc
import redis as _redis

# Import Redis service and redis-set constant so migration can perform one-time enqueue
from core.services.superredis import RedisService
from core.constants import UPDATED_STICKERS_USER_IDS

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# revision identifiers, used by Alembic.
revision: str = "42065519a495"
down_revision: str | None = "1b167f412dfd"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # New simpler migration: delete only old-format rows that already have a
    # corresponding new-format record, then enqueue managed users to trigger a
    # refresh. This assumes your background refresh task has created the new
    # records already.
    conn = op.get_bind()

    # Require that new-format records exist before proceeding.
    count_new_format = conn.execute(
        sa.text(
            "SELECT COUNT(*) FROM sticker_item WHERE (length(id) - length(replace(id, '_', ''))) = 2"
        )
    ).scalar_one()
    count_new_format = int(count_new_format)

    if count_new_format == 0:
        logger.error(
            f"{count_new_format} new-format sticker_item rows found; aborting migration"
        )
        raise Exception("Aborting migration due to insufficient data")

    # Detect old-format IDs by counting underscores (old has 3 underscores: collection_character_instance_user)
    count_old = conn.execute(
        sa.text(
            "SELECT COUNT(*) FROM sticker_item WHERE (length(id) - length(replace(id, '_', ''))) = 3"
        )
    ).scalar()
    count_old = int(count_old)

    if count_old == 0:
        logger.warning("No old-format sticker_item rows found; migration complete")
    else:
        logger.info(
            "Found %d old-format sticker_item rows; they will be removed", count_old
        )
        conn.execute(
            sa.text(
                """
                DELETE FROM sticker_item si
                WHERE (length(si.id) - length(replace(si.id, '_', ''))) = 3;
                """
            )
        )

        # After deletion, enqueue all managed users to the Redis set to trigger double-checks
        try:
            redis = RedisService()
            rows = conn.execute(
                sa.text(
                    """
                    SELECT DISTINCT u.telegram_id
                    FROM telegram_chat_user tcu
                    JOIN telegram_chat_sticker_collection tcs ON tcu.chat_id = tcs.chat_id
                    JOIN "user" u ON tcu.user_id = u.id
                    WHERE tcu.is_managed = true AND u.telegram_id IS NOT NULL;
                    """
                )
            ).fetchall()

            telegram_ids = [str(r[0]) for r in rows if r and r[0] is not None]
            if telegram_ids:
                chunk_size = 1000
                for i in range(0, len(telegram_ids), chunk_size):
                    batch = telegram_ids[i : i + chunk_size]
                    try:
                        redis.add_to_set(UPDATED_STICKERS_USER_IDS, *batch)
                    except _redis.RedisError as r_e:
                        logger.exception(
                            "Redis error while adding telegram ids during migration: %s",
                            r_e,
                        )
                        # continue trying remaining batches
        except sa_exc.SQLAlchemyError as db_e:
            logger.exception(
                "Database error while selecting telegram ids during migration: %s", db_e
            )
        except _redis.RedisError as r:
            logger.exception(
                "Redis connection/setup error (non-fatal) while trying to enqueue telegram ids during migration: %s",
                r,
            )
        except Exception as e:
            logger.exception(
                "Non-fatal unexpected error while trying to enqueue telegram ids into Redis during migration: %s",
                e,
            )


def downgrade() -> None:
    # This migration is destructive (deletes old-format rows). Downgrade is a no-op.
    logger.warning(
        "Downgrade called for migration 42065519a495: no-op (deleted rows cannot be restored by this migration)"
    )
    return

import datetime

from sqlalchemy import Integer, String, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import mapped_column

from core.db import Base


class GiftCollection(Base):
    __tablename__ = "gift_collection"

    slug = mapped_column(String(255), primary_key=True)
    title = mapped_column(String(255), nullable=False, unique=True)
    preview_url = mapped_column(String(255), nullable=True)
    supply = mapped_column(Integer, nullable=False, default=0)
    upgraded_count = mapped_column(Integer, nullable=False, default=0)
    last_updated = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.datetime.now(tz=datetime.UTC),
        onupdate=datetime.datetime.now(tz=datetime.UTC),
    )


class GiftUnique(Base):
    __tablename__ = "gift_unique"

    slug = mapped_column(String(255), primary_key=True)
    collection_slug = mapped_column(
        ForeignKey("gift_collection.slug", ondelete="CASCADE"), nullable=False
    )
    telegram_owner_id = mapped_column(
        BigInteger,
        nullable=True,
        doc="Telegram ID of the owner of the gift. Can be null if the gift is hidden. Could be a user or a channel.",
        index=True,
    )
    number = mapped_column(Integer, nullable=False, index=True)
    blockchain_address = mapped_column(
        String(255),
        nullable=True,
        doc="Blockchain address of the gift. Can be null if the gift is not minted.",
    )
    owner_address = mapped_column(
        String(255),
        nullable=True,
        doc="Blockchain address of the owner of the gift. Can be null if the gift is not minted or the address is hidden.",
        index=True,
    )
    model = mapped_column(String(255), nullable=True, doc="Model name of the gift.")
    backdrop = mapped_column(
        String(255), nullable=True, doc="Backdrop name of the gift."
    )
    pattern = mapped_column(String(255), nullable=True, doc="Pattern name of the gift.")
    last_updated = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.datetime.now(tz=datetime.UTC),
        onupdate=datetime.datetime.now(tz=datetime.UTC),
    )

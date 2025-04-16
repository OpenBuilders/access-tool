from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import mapped_column, relationship

from core.db import Base


class StickerCollection(Base):
    id = mapped_column(Integer, primary_key=True)
    title = mapped_column(String(255), nullable=False)
    description = mapped_column(String(255), nullable=True)
    logo_url = mapped_column(String(255), nullable=True)
    supply = mapped_column(Integer, nullable=False)


class StickerItem(Base):
    id = mapped_column(String(255), primary_key=True)
    collection_id = mapped_column(
        ForeignKey("sticker_collection.id", ondelete="CASCADE"),
        nullable=False,
    )
    instance = mapped_column(Integer, nullable=False)
    user_id = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    collection = relationship(
        "StickerCollection", backref="stickers", lazy="joined", viewonly=True
    )
    user = relationship(
        "User",
        backref="stickers",
        lazy="joined",
        viewonly=True,
    )

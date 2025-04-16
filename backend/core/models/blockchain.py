from sqlalchemy import String, Boolean, DateTime, func, BigInteger, ForeignKey
from sqlalchemy.dialects.mysql import TEXT
from sqlalchemy.orm import mapped_column, relationship, Mapped

from core.db import Base
from core.dtos.base import BaseNftCollectionMetadataDTO, BaseNftItemMetadataDTO
from core.models.fields import (
    BlockchainAddressRawField,
    NftItemMetadataField,
    NftCollectionMetadataField,
)


class Jetton(Base):
    __tablename__ = "jetton"

    address = mapped_column(BlockchainAddressRawField, primary_key=True)
    name = mapped_column(String(255), nullable=False)
    description = mapped_column(TEXT, nullable=True)
    symbol = mapped_column(String(255), nullable=False)
    total_supply = mapped_column(BigInteger, nullable=False)
    logo_path = mapped_column(String(290), nullable=True)
    is_enabled = mapped_column(Boolean, nullable=False, default=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    telegram_chat_jettons = relationship(
        "TelegramChatJetton",
        back_populates="jetton",
    )

    def __repr__(self):
        return f"<Jetton(address={self.address}, name={self.name})>"


class NFTCollection(Base):
    __tablename__ = "nft_collection"

    address = mapped_column(BlockchainAddressRawField, primary_key=True)
    name = mapped_column(String(255), nullable=False)
    description = mapped_column(TEXT, nullable=True)
    logo_path = mapped_column(String(290), nullable=True)
    is_enabled = mapped_column(Boolean, nullable=False, default=True)
    blockchain_metadata: Mapped[BaseNftCollectionMetadataDTO] = mapped_column(
        NftCollectionMetadataField,
        nullable=True,
        doc="Metadata of the collection, such as attributes, traits, etc.",
    )
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    telegram_chat_nft_collections = relationship(
        "TelegramChatNFTCollection",
        back_populates="nft_collection",
    )

    def __repr__(self):
        return f"<NFTCollection(address={self.address}, name={self.name})>"


class NftItem(Base):
    __tablename__ = "nft_item"

    address = mapped_column(BlockchainAddressRawField, primary_key=True)
    owner_address = mapped_column(
        ForeignKey("user_wallet.address", ondelete="CASCADE"),
        nullable=False,
    )
    collection_address = mapped_column(
        ForeignKey("nft_collection.address", ondelete="CASCADE"),
        nullable=False,
    )

    # Check NftItemMetadataDTO for expected structure
    blockchain_metadata: Mapped[BaseNftItemMetadataDTO] = mapped_column(
        NftItemMetadataField,
        nullable=True,
        doc="Metadata of the NFT, such as attributes, traits, etc.",
    )
    created_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return f"<NftItem(address={self.address})>"

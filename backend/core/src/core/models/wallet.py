from sqlalchemy import (
    ForeignKey,
    DateTime,
    Integer,
    Boolean,
    func,
    UniqueConstraint,
    PrimaryKeyConstraint,
)
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import mapped_column, relationship

from core.constants import DEFAULT_WALLET_BALANCE
from core.db import Base
from core.models.fields import BlockchainAddressRawField


class UserWallet(Base):
    """
    This table keeps relationship between User and UserWallet.
     It keeps all the wallets that were connected by user at any time,
     allowing to select them without a new TON Connect connection.
    """

    __tablename__ = "user_wallet"

    address = mapped_column(BlockchainAddressRawField, primary_key=True)
    user_id = mapped_column(ForeignKey("user.id"), nullable=False)
    balance = mapped_column(BIGINT, nullable=True, doc="Balance of the wallet in TONs")
    # DEPRECATED attribute
    hide_wallet = mapped_column(Boolean, default=False, nullable=False)

    created_at = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    chat_links = relationship(
        "TelegramChatUserWallet",
        back_populates="wallet",
    )

    __table_args__ = (
        UniqueConstraint("address", "user_id", name="uq_wallet_address_user_id"),
    )

    def __repr__(self) -> str:
        return f"<UserWallet(address={self.address}, user_id={self.user_id})>"


class TelegramChatUserWallet(Base):
    """
    This table keeps relationship between TelegramChat and UserWallet.
    It allows to link different wallets to different chats.

    This should be used for the initial and recurrent eligibility checks
    """

    __tablename__ = "telegram_chat_user_wallet"

    user_id = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    chat_id = mapped_column(
        ForeignKey("telegram_chat.id", ondelete="CASCADE"), nullable=False
    )
    address = mapped_column(
        ForeignKey("user_wallet.address", ondelete="CASCADE"), nullable=False
    )

    user = relationship(
        "User",
        back_populates="wallet_links",
        lazy="joined",
        viewonly=True,
    )
    user_chat = relationship(
        "TelegramChatUser",
        uselist=False,
        back_populates="wallet_link",
        primaryjoin="and_(foreign(TelegramChatUser.user_id) == TelegramChatUserWallet.user_id, foreign(TelegramChatUser.chat_id) == TelegramChatUserWallet.chat_id)",
        lazy="joined",
        viewonly=True,
    )
    wallet = relationship(
        "UserWallet",
        back_populates="chat_links",
        lazy="joined",
        viewonly=True,
    )

    __table_args__ = (PrimaryKeyConstraint("chat_id", "address"),)

    def __repr__(self) -> str:
        return f"<UserTelegramChatWallet(chat_id={self.chat_id}, user_id={self.user_id}, address={self.address})>"


class JettonWallet(Base):
    __tablename__ = "jetton_wallet"

    address = mapped_column(BlockchainAddressRawField, primary_key=True)
    jetton_master_address = mapped_column(
        ForeignKey("jetton.address", ondelete="CASCADE"),
        nullable=False,
    )
    owner_address = mapped_column(
        ForeignKey("user_wallet.address", ondelete="CASCADE"),
        nullable=False,
    )
    balance = mapped_column(BIGINT, default=DEFAULT_WALLET_BALANCE, nullable=False)
    rating = mapped_column(Integer, default=None, nullable=True)
    created_at = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<JettonWallet(address={self.address}, jetton_master_address={self.jetton_master_address})>"

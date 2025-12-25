from pydantic import BaseModel


class TargetChatMembersDTO(BaseModel):
    wallets: list[str]
    sticker_owners_ids: list[int]
    gift_owners_ids: list[int]
    target_chat_members: set[tuple[int, int]]

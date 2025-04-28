from httpx import AsyncClient, Timeout

from core.constants import REQUEST_TIMEOUT, READ_TIMEOUT, CONNECT_TIMEOUT
from core.dtos.sticker import (
    StickerDomCollectionOwnershipDTO,
    StickerDomCollectionOwnershipMetadataDTO,
)
from core.settings import core_settings
from core.utils.cipher import load_private_key, rsa_decrypt_wrapped_dek, aes_decrypt

timeout = Timeout(REQUEST_TIMEOUT, read=READ_TIMEOUT, connect=CONNECT_TIMEOUT)

DEFAULT_NONCE_SIZE = 12
DEFAULT_TAG_SIZE = 16


class StickerDomService:
    def __init__(self) -> None:
        self.private_key = load_private_key(core_settings.sticker_dom_private_key_path)

    @staticmethod
    def _get_ownership_url(collection_id: int) -> str:
        return (
            f"{core_settings.sticker_dom_base_url}/data/ownership"
            f"?consumer_id={core_settings.sticker_dom_consumer_id}"
            f"&collection_id={collection_id}"
        )

    async def fetch_collection_ownership_metadata(
        self,
        collection_id: int,
    ) -> StickerDomCollectionOwnershipMetadataDTO:
        async with AsyncClient() as client:
            # Step 1: Get URL for collection data bucket with wrapped DEK
            meta_response = await client.get(self._get_ownership_url(collection_id))
            meta_response.raise_for_status()

            metadata = meta_response.json()
            if not metadata["ok"]:
                raise ValueError(metadata["errorCode"])

            # Step 2: Extract URL and DEK from the response metadata
            bucket_url = metadata["data"]["url"]
            wrapped_dek = metadata["data"]["key"]

            # Step 3: Decode wrapped DEK with a private key
            plain_dek = rsa_decrypt_wrapped_dek(
                wrapped_dek=bytes.fromhex(wrapped_dek), private_key=self.private_key
            )
            return StickerDomCollectionOwnershipMetadataDTO(
                collection_id=collection_id,
                url=bucket_url,
                plain_dek=plain_dek,
            )

    @staticmethod
    async def fetch_collection_ownership_data(
        metadata: StickerDomCollectionOwnershipMetadataDTO,
    ) -> StickerDomCollectionOwnershipDTO:
        async with AsyncClient() as client:
            # Step 4: Get encrypted bucket data
            response = await client.get(url=metadata.url)
            response.raise_for_status()
            # Step 5: Split response content for nonce, ciphertext, and tag
            nonce, ciphertext, tag = (
                response.content[:DEFAULT_NONCE_SIZE],
                response.content[DEFAULT_NONCE_SIZE:-DEFAULT_TAG_SIZE],
                response.content[-DEFAULT_TAG_SIZE:],
            )
            # Step 6: Decrypt bucket data with AES-GCM
            raw_collections_data = aes_decrypt(
                nonce,
                ciphertext,
                dek=metadata.plain_dek,
                tag=tag,
            )
            return StickerDomCollectionOwnershipDTO.from_raw(
                raw_collections_data,
                collection_id=metadata.collection_id,
            )

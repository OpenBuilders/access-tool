import httpx
from pydantic import ValidationError

from core.dtos.gift.collection import (
    GiftCollectionMetadataDTO,
    GiftCollectionOptionsDTO,
)


class GiftChangesIndexer:
    def __init__(self) -> None:
        self.client = httpx.AsyncClient()
        self.base_url = "https://api.changes.tg"
        self.cdn_url = "https://cdn.changes.tg/gifts"

    async def fetch_all_collections(self) -> list[GiftCollectionMetadataDTO]:
        """
        Fetches all available collection IDs, then fetches specifics for each ID.
        Constructs and validates the GiftCollectionMetadataDTO for each collection.
        Returns a list of validated collections.
        """
        ids_url = f"{self.base_url}/ids"
        response = await self.client.get(ids_url)
        response.raise_for_status()

        # The API returns {"5983471780763796287":"Santa Hat", ...}
        ids_data: dict[str, str] = response.json()
        collections: list[GiftCollectionMetadataDTO] = []

        for gift_id, title in ids_data.items():
            collection = await self.fetch_single_collection(gift_id, title)
            if collection:
                collections.append(collection)

        return collections

    async def fetch_single_collection(
        self, gift_id: str, title: str
    ) -> GiftCollectionMetadataDTO | None:
        """
        Fetches details for a single gift ID and constructs its Metadata DTO.
        """
        gift_url = f"{self.base_url}/gift/{gift_id}"
        response = await self.client.get(gift_url)

        if response.status_code != 200:
            return None

        data = response.json()

        # Parse attributes
        models = [item["name"] for item in data.get("models", [])]
        backdrops = [item["name"] for item in data.get("backdrops", [])]
        symbols = [item["name"] for item in data.get("symbols", [])]

        preview_url = f"{self.cdn_url}/originals/{gift_id}/Original.png"

        try:
            # We construct supply and upgraded as 0 right now
            # as it will be safely overwritten later if necessary
            dto = GiftCollectionMetadataDTO(
                id=gift_id,
                title=title,
                preview_url=preview_url,
                supply=0,
                upgraded_count=0,
                options=GiftCollectionOptionsDTO(
                    models=models,
                    backdrops=backdrops,
                    patterns=symbols,
                ),
            )
            return dto
        except ValidationError:
            # If the properties fail validation, we return None and skip this element
            return None

    async def close(self) -> None:
        await self.client.aclose()

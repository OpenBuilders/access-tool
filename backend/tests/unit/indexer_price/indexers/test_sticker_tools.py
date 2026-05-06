import pytest
import respx
from httpx import Response

from indexer_price.indexers.sticker_tools import StickerToolsIndexer


@pytest.mark.asyncio
@respx.mock
async def test_get_stats_unwraps_data_envelope_and_passes_issuers() -> None:
    payload = {
        "success": True,
        "error": None,
        "data": {
            "collections": {
                "1": {
                    "id": "1",
                    "name": "DOGS OG",
                    "stickers": {
                        "10": {
                            "id": "10",
                            "name": "Cook",
                            "current": {
                                "price": {"floor": {"usd": 4.88, "ton": 2.5}}
                            },
                        }
                    },
                }
            }
        },
    }
    route = respx.get("https://stickers.tools/api/v1/market/stats").mock(
        return_value=Response(200, json=payload)
    )

    indexer = StickerToolsIndexer()
    try:
        stats = await indexer.get_stats()
    finally:
        await indexer.client.aclose()

    assert route.called
    assert (
        route.calls[0].request.url.params["issuers"]
        == "Sticker Pack,Sticker Pad"
    )
    assert stats.collections[1].id == 1
    assert stats.collections[1].characters[10].current.price.floor.usd == 4.88
    assert stats.collections[1].characters[10].current.price.floor.ton == 2.5

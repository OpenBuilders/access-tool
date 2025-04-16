import asyncio

from indexer.indexers.tonapi import TonApiService


async def main():
    # service = GetGemsService()
    # result = await service.get_collection_attributes(
    #     "EQAl_hUCAeEv-fKtGxYtITAS6PPxuMRaQwHj0QAHeWe6ZSD0"
    # )
    ton_api_service = TonApiService()
    result = await ton_api_service.parse_nft_collection_metadata(
        "EQAl_hUCAeEv-fKtGxYtITAS6PPxuMRaQwHj0QAHeWe6ZSD0"
    )
    print(result)


if __name__ == "__main__":
    asyncio.run(main())

from pathlib import Path

from gql import Client
from gql.transport.httpx import HTTPXAsyncTransport

from core.dtos.resource import NftCollectionDTO
from core.dtos.base import NftCollectionAttributeDTO
from indexer.utils.graphql import get_gql_by_name

transport = HTTPXAsyncTransport(url="https://api.getgems.io/graphql")


class GetGemsService:
    def __init__(self) -> None:
        with open(
            Path(__file__).parent.parent / "data" / "graphql" / "getgems.graphql", "r"
        ) as f:
            schema = f.read()
        self.client = Client(transport=transport, schema=schema)

    async def get_collection_data(self, address: str) -> NftCollectionDTO:
        async with self.client as session:
            result = await session.execute(
                get_gql_by_name("getNftCollectionBasic"),
                variable_values={"address": address},
            )

        payload = result["nftCollectionByAddress"]
        return NftCollectionDTO(
            name=payload["name"],
            description=payload["description"],
            logo_path=payload["coverImage"]["image"]["baseUrl"],
            address=address,
            is_enabled=True,
        )

    async def get_collection_attributes(
        self, address: str
    ) -> list[NftCollectionAttributeDTO]:
        async with self.client as session:
            result = await session.execute(
                get_gql_by_name("getNftCollectionAttributes"),
                variable_values={"address": address},
            )

        payload = result["alphaNftCollectionFilter"]
        return [
            NftCollectionAttributeDTO(
                trait_type=attribute["traitType"],
                values=list({v["value"] for v in attribute["values"]}),
            )
            for attribute in payload["attributes"]
        ]

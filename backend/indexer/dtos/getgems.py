from pydantic import BaseModel


class GetGemsNftCollectionBasicInfo(BaseModel):
    contract_address: str
    name: str | None
    slug: str
    floor: float
    volume: float
    total_supply: int
    sales_count: int
    unique_owners: int | None
    image_url: str | None
    getgems_url: str


class GetGemsNftCollectionFloorResponse(BaseModel):
    success: bool
    response: GetGemsNftCollectionBasicInfo

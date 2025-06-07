import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.params import Query
from sqlalchemy.orm import Session
from starlette.status import HTTP_404_NOT_FOUND

from api.deps import get_db_session, get_address_raw
from api.pos.blockchain import (
    GetJettonCPO,
    GetNftCollectionCPO,
    JettonFDO,
    NftCollectionFDO,
)
from api.pos.common import StatusFDO, CategoriesFDO
from api.pos.gift import GiftCollectionsMetadataFDO
from api.pos.sticker import MinimalStickerCollectionWithCharactersFDO
from core.actions.gift import GiftUniqueAction
from core.actions.jetton import JettonAction
from core.actions.nft_collection import NftCollectionAction
from core.actions.sticker import StickerCharacterAction
from core.enums.jetton import CurrencyCategory
from core.enums.nft import ASSET_TO_CATEGORY_TYPE_MAPPING
from core.exceptions.external import ExternalResourceNotFound
from core.services.jetton import JettonService

logger = logging.getLogger(__name__)

admin_resource_router = APIRouter(prefix="/resources", tags=["Resources management"])


@admin_resource_router.get("/prefetch/jettons")
async def fetch_jetton_details(
    address_raw: Annotated[str, Depends(get_address_raw)],
    db_session: Session = Depends(get_db_session),
) -> JettonFDO:
    jetton_action = JettonAction(db_session)
    try:
        jetton_data = await jetton_action.prefetch(address_raw=address_raw)
        return JettonFDO.model_validate(jetton_data.model_dump())
    except ExternalResourceNotFound:
        raise HTTPException(
            detail=f"Jetton data not found for {address_raw!r}",
            status_code=HTTP_404_NOT_FOUND,
        )


@admin_resource_router.get("/prefetch/nft-collections")
async def fetch_nft_collection_details(
    address_raw: Annotated[str, Depends(get_address_raw)],
    db_session: Session = Depends(get_db_session),
) -> NftCollectionFDO:
    nft_collection_action = NftCollectionAction(db_session)
    try:
        nft_collection_dto = await nft_collection_action.prefetch(
            address_raw=address_raw
        )
        return NftCollectionFDO.model_validate(nft_collection_dto.model_dump())
    except ExternalResourceNotFound:
        raise HTTPException(
            detail=f"NFT collection data not found for {address_raw!r}",
            status_code=HTTP_404_NOT_FOUND,
        )


@admin_resource_router.get("/categories/nft-collections")
async def get_nft_collection_categories() -> list[CategoriesFDO]:
    return [
        CategoriesFDO(
            asset=asset.value,
            categories=(
                ([None] if category_definition.is_optional else [])
                + list(category_definition.enum)
            ),
        )
        for asset, category_definition in ASSET_TO_CATEGORY_TYPE_MAPPING.items()
    ]


@admin_resource_router.get("/categories/jettons")
@admin_resource_router.get("/categories/toncoin")
async def get_currency_categories() -> list[CategoriesFDO]:
    return [CategoriesFDO(asset="Currency", categories=list(CurrencyCategory))]


@admin_resource_router.get("/stickers")
async def get_stickers_collections(
    db_session: Session = Depends(get_db_session),
) -> list[MinimalStickerCollectionWithCharactersFDO]:
    action = StickerCharacterAction(db_session)
    collections = await action.get_all_grouped()

    return [
        MinimalStickerCollectionWithCharactersFDO.from_dto(collection)
        for collection in collections
    ]


@admin_resource_router.get("/jettons", deprecated=True)
async def get_jettons(
    param: Annotated[GetJettonCPO, Query()],
    db_session: Session = Depends(get_db_session),
) -> list[JettonFDO]:
    jetton_service = JettonService(db_session)
    jettons = jetton_service.get_all(whitelisted_only=param.whitelisted_only)

    return [JettonFDO.from_orm(jetton) for jetton in jettons]


@admin_resource_router.get("/jettons/{jetton_address}", deprecated=True)
async def get_jetton(
    jetton_address: str,
    db_session: Session = Depends(get_db_session),
) -> JettonFDO:
    jetton_service = JettonService(db_session)
    jetton = jetton_service.get(jetton_address)

    return JettonFDO.from_orm(jetton)


@admin_resource_router.get("/nft-collections", deprecated=True)
async def get_nft_collections(
    param: Annotated[GetNftCollectionCPO, Query()],
    db_session: Session = Depends(get_db_session),
) -> list[NftCollectionFDO]:
    nft_collection_action = NftCollectionAction(db_session)
    return [
        NftCollectionFDO.model_validate(obj.model_dump())
        for obj in nft_collection_action.get_all(
            whitelisted_only=param.whitelisted_only
        )
    ]


@admin_resource_router.get("/nft-collections/{nft_collection_address}", deprecated=True)
async def get_nft_collection(
    nft_collection_address: str,
    db_session: Session = Depends(get_db_session),
) -> NftCollectionFDO:
    nft_collection_action = NftCollectionAction(db_session)
    result = nft_collection_action.get(address_raw=nft_collection_address)
    return NftCollectionFDO.model_validate(result.model_dump())


@admin_resource_router.post("/nft-collections/{nft_collection_address}/metadata")
async def refresh_nft_collection_metadata(
    nft_collection_address: str,
    db_session: Session = Depends(get_db_session),
) -> StatusFDO:
    nft_collection_action = NftCollectionAction(db_session)
    await nft_collection_action.refresh_metadata(nft_collection_address)
    return StatusFDO(
        status="success",
        message="Metadata refresh initiated. It could take some time",
    )


@admin_resource_router.get("/gifts")
async def get_gifts_options(
    db_session: Session = Depends(get_db_session),
) -> GiftCollectionsMetadataFDO:
    action = GiftUniqueAction(db_session)
    result = action.get_metadata()
    return GiftCollectionsMetadataFDO.from_dto(result)

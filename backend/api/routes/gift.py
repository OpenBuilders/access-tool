import logging
from typing import Annotated

from fastapi import APIRouter, Query, HTTPException
from fastapi.params import Depends
from pydantic import BeforeValidator
from sqlalchemy.orm import Session
from starlette.status import HTTP_200_OK, HTTP_404_NOT_FOUND

from api.deps import get_db_session
from api.pos.base import BaseExceptionFDO
from api.pos.chat import WhitelistRuleUsersFDO
from api.pos.gift import GiftFilterPO, GiftUniqueItemsFDO, GiftUniqueInfoFDO
from core.actions.gift import GiftUniqueAction

gift_router = APIRouter(prefix="/gifts", tags=["Gift"])
logger = logging.getLogger(__name__)


@gift_router.get(
    "/owners",
    description="Returns a list of users owning any of the provided gifts in the options.",
    response_model=WhitelistRuleUsersFDO,
)
async def get_gifts_owners(
    options: list[
        Annotated[
            GiftFilterPO, BeforeValidator(lambda s: GiftFilterPO.from_query_string(s))
        ]
    ] = Query(
        ...,
        description="Encoded list of filter values. The OR logic between items will be applied, meaning that any of the matched options will be returned.",
    ),
    db_session: Session = Depends(get_db_session),
) -> WhitelistRuleUsersFDO:
    gift_unique_action = GiftUniqueAction(db_session=db_session)
    try:
        holders = gift_unique_action.get_collections_holders(options=options)
    except ValueError as e:
        logger.warning("Wrong filter format: %s", e)
        raise HTTPException(
            detail=str(e),
            status_code=400,
        )

    return WhitelistRuleUsersFDO(users=list(holders))


@gift_router.get(
    "/{collection_slug}",
    description="Returns an object of gift with their holders (telegram ID and blockchain address)",
    responses={
        HTTP_200_OK: {"model": GiftUniqueItemsFDO},
        HTTP_404_NOT_FOUND: {
            "model": BaseExceptionFDO,
            "description": "Collection not found",
        },
    },
)
async def get_collection_holders(
    collection_slug: str,
    db_session: Session = Depends(get_db_session),
) -> GiftUniqueItemsFDO:
    gift_unique_action = GiftUniqueAction(db_session=db_session)
    items = gift_unique_action.get_all(collection_slug=collection_slug)
    return GiftUniqueItemsFDO(
        items=[GiftUniqueInfoFDO.from_dto(item) for item in items]
    )

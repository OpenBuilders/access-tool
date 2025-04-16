from fastapi import APIRouter, Depends

from api.deps import validate_user_init_data
from api.pos.auth import TokenFDO
from api.services.authentication import AuthenticationService
from api.settings import api_settings
from core.dtos.user import TelegramUserDTO, UserInitDataPO
from core.services.db import DBService
from core.services.user import UserService

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post("/telegram", description="Default authentication method")
async def telegram_auth(
    user_data: UserInitDataPO = Depends(validate_user_init_data),
) -> TokenFDO:
    with DBService().db_session() as db_session:
        user_service = UserService(db_session)
        user = user_service.create_or_update(
            telegram_user=TelegramUserDTO(
                id=user_data.id,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                username=user_data.username,
                is_premium=user_data.is_premium,
                language_code=user_data.language_code,
                photo_url=user_data.photo_url,
            )
        )

        authentication_service = AuthenticationService()
        jwt_token = authentication_service.create_access_token(
            user_id=user.id, expires_in=api_settings.jwt_expiry
        )
    return TokenFDO(access_token=jwt_token, expires_in=api_settings.jwt_expiry)

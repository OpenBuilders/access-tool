import sentry_sdk
from fastapi import FastAPI, APIRouter, Depends
from starlette.middleware.cors import CORSMiddleware

from api.deps import validate_access_token
from api.routes.admin.chat import admin_chat_router
from api.routes.admin.resource import admin_resource_router
from api.routes.auth import auth_router
from api.routes.chat import chat_router
from api.routes.system import system_router, system_non_authenticated_router
from api.routes.user import user_router
from api.settings import api_settings

sentry_sdk.init(
    dsn=api_settings.sentry_dns,
    # Add data like request headers and IP for users,
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    send_default_pii=True,
    environment=api_settings.env,
)


def include_authenticated_routes(_app: FastAPI) -> None:
    authenticated_router = APIRouter(dependencies=[Depends(validate_access_token)])
    authenticated_router.include_router(chat_router)
    authenticated_router.include_router(user_router)
    authenticated_router.include_router(system_router)
    _app.include_router(authenticated_router)


def include_non_authenticated_routes(_app: FastAPI) -> None:
    non_authenticated_router = APIRouter()
    non_authenticated_router.include_router(auth_router)
    non_authenticated_router.include_router(system_non_authenticated_router)
    _app.include_router(non_authenticated_router)


def include_admin_routes(_app: FastAPI) -> None:
    admin_router = APIRouter(
        prefix="/admin", dependencies=[Depends(validate_access_token)]
    )
    admin_router.include_router(admin_chat_router)
    admin_router.include_router(admin_resource_router)
    _app.include_router(admin_router)


def create_app() -> FastAPI:
    _app = FastAPI(
        root_path="/api",
        title="Gateway",
        summary="Your gate to the web3 world",
        version="0.1.0",
    )
    include_authenticated_routes(_app)
    include_non_authenticated_routes(_app)
    include_admin_routes(_app)
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Adjust this to your needs
        allow_credentials=True,
        allow_methods=["POST", "GET", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization"],
    )
    return _app


app = create_app()

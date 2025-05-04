from api.settings import api_settings


def get_cdn_absolute_url(path: str | None) -> str | None:
    if not path or path.startswith("http"):
        return path

    return f"{api_settings.internal_cdn_base_url}/{path}"

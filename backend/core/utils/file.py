import logging
import re
from pathlib import Path

from httpx import Client, Response
from pytonapi.schema.nft import ImagePreview

from core.constants import STATIC_PATH

client = Client()

logger = logging.getLogger(__name__)


CONTENT_DISPOSITION_FILENAME_REGEX = re.compile(r'filename="(.+)"')


def get_filename_from_content_disposition(response: Response) -> str | None:
    """
    Extract filename from Content-Disposition header.
    """
    content_disposition = response.headers.get("Content-Disposition")
    match = CONTENT_DISPOSITION_FILENAME_REGEX.search(content_disposition)
    if match:
        return match.group(1)
    return None


def guess_file_extension(response: Response) -> str | None:
    """
    Guess the file extension from the response content type.
    """
    content_type = response.headers.get("Content-Type")
    if content_type:
        return content_type.split("/")[-1]

    if filename := get_filename_from_content_disposition(response):
        return filename.split(".")[-1]

    return None


def download_media(
    url: str,
    name: str,
    subdirectory: str | Path | None = None,
    default_extension: str = ".webp",
) -> Path | None:
    """
    Download media from URL.

    :param url: URL to download media from.
    :param name: Name of the file that will be used. Should not include the extension.
    :param subdirectory: Subdirectory to save the file in.
    :param default_extension: Default extension to use if the extension cannot be guessed.

    :return: Path to the downloaded file if file was downloaded successfully, None otherwise.
    """
    root_path = STATIC_PATH / (subdirectory or "")

    try:
        response = client.get(url)
    except:  # noqa: E722
        logger.exception("Unable to download media")
        return None

    file_name = f"{name}.{guess_file_extension(response) or default_extension}"
    full_path = root_path / file_name
    with open(full_path, "wb") as file:
        file.write(response.content)

    return full_path


def pick_best_preview(previews: list[ImagePreview]) -> ImagePreview:
    """
    Pick the best image preview from a list of previews.
    """
    try:
        return max(
            previews,
            key=lambda preview: preview.resolution.split("x")[0]
            * preview.resolution.split("x")[1],
        )
    except (TypeError, ValueError):
        logger.warning("Could not pick the best preview. Returning the last one")
        return previews[-1]


def clean_old_versions(
    path: Path,
    prefix: str,
    current_file: str,
) -> None:
    """
    Clean old versions of files in a path

    :param path: Path to the directory containing the files.
    :param prefix: Prefix of the files to clean.
    :param current_file: Current file name.
    """
    for file in path.glob(f"{prefix}*"):
        if file.name != current_file:
            file.unlink()

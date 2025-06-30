import logging
import re
from pathlib import Path
from typing import IO, Self

from httpx import Client, Response
from pytonapi.schema.nft import ImagePreview

from core.constants import DEFAULT_INCREMENTED_FILE_VERSION

client = Client()

logger = logging.getLogger(__name__)


CONTENT_DISPOSITION_FILENAME_REGEX = re.compile(r'filename="(.+)"')
VERSIONED_FILE_NAME_SEPARATOR = "?v="
VERSIONED_FILE_NAME_REGEX = re.compile(
    r"^(?P<base_name>\S+)\.(?P<extension>\w{2,5})(\?v=(?P<version>\d+))?$"
)


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
    target_location: IO[bytes],
    default_extension: str = "webp",
) -> str | None:
    """
    Downloads media from a URL and writes it to the specified location. If the file
    extension cannot be determined, a default extension is applied. The function
    also returns the appropriate file extension used for the media, or None in
    case of failure.

    :param url: The URL of the media file to be downloaded.
    :param target_location: A writable binary stream where the media content
        will be saved.
    :param default_extension: Optional default file extension to use if the
        file extension cannot be determined. The default is ".webp".
    :return: The file extension that is applied to the downloaded media or None if
        the download fails.
    """
    logger.debug(f"Downloading media from {url!r}")
    try:
        response = client.get(url)
    except:  # noqa: E722
        logger.exception("Unable to download media")
        return None

    file_extension = guess_file_extension(response) or default_extension
    target_location.write(response.content)
    logger.info(
        f"Media downloaded and saved to {target_location.name!r}, size: {len(response.content)} bytes"
    )
    return file_extension


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


class VersionedFile:
    """
    Represents a versioned file with components such as base name, version, and extension.

    The class provides functionality to manage and manipulate versioned file naming conventions.
    It allows for creating a versioned file object from its components or parsing an existing
    filename to extract its components.
    It also supports dynamic property access for retrieving the file's individual attributes
    like base name, version, extension, and the full formatted name.

    :ivar _base_name: The base name of the file.
    :ivar _version: The version of the file, or None if no version is specified.
    :ivar _extension: The file extension.
    :ivar _source_full_name: The full formatted name of the file, including base name, version (if available),
        and extension.
    """

    _base_name: str
    _version: int | None
    _extension: str

    def __init__(
        self, base_name: str, extension: str, version: int | None = None
    ) -> None:
        if version is None:
            # Always use the default incremented version for a newly constructed file path if no version provided
            version = DEFAULT_INCREMENTED_FILE_VERSION

        self._base_name, self._version = base_name, version
        if not extension.startswith("."):
            extension = f".{extension}"
        self._extension = extension
        self._source_full_name = self._format_file_name()

    @classmethod
    def from_filename(cls, file_name: str) -> Self:
        """Alternative constructor that creates a VersionedFile from a full filename"""
        instance = cls.__new__(cls)
        instance._source_full_name = file_name
        (
            instance._base_name,
            instance._version,
            instance._extension,
        ) = instance._parse_file_name()
        return instance

    def _format_file_name(self) -> str:
        """
        Returns the full formatted name of the file, including base name and extension only
        """
        return f"{self.base_name}{self._extension}"

    def _resolve_file_name(self) -> str:
        """
        Resolves the file name based on the version.
        """
        return f"{self.base_name}{self._extension}?v={self._version}"

    def _parse_file_name(self) -> tuple[str, int | None, str]:
        match = VERSIONED_FILE_NAME_REGEX.match(self._source_full_name)
        if not match:
            raise ValueError(f"Invalid file name: {self._source_full_name}")

        base_name = match.group("base_name")
        extension = match.group("extension")
        version = match.group("version")
        if version:
            version = int(version)
        return base_name, version, f".{extension}"

    @property
    def full_name(self) -> str:
        """
        Returns the full formatted name of the file, including base name and extension.
        """
        return self._format_file_name()

    @property
    def resolved_full_name(self) -> str:
        """
        Returns the full formatted name of the file, including base name, version, and extension.
        """
        return self._resolve_file_name()

    @property
    def base_name(self) -> str:
        return self._base_name

    @property
    def version(self) -> int | None:
        return self._version

    def get_next_version(self) -> int:
        return (
            (self._version + 1)
            if self._version is not None
            else DEFAULT_INCREMENTED_FILE_VERSION
        )

    @property
    def extension(self) -> str:
        return self._extension

import re

import pytest

from core.constants import DEFAULT_INCREMENTED_FILE_VERSION
from core.utils.file import VersionedFile


@pytest.mark.parametrize(
    ("input_filename", "expected_base_name", "expected_extension", "expected_version"),
    [
        ("test.txt", "test", ".txt", None),
        ("test.txt?v=1", "test", ".txt", 1),
        ("test.png?v=123", "test", ".png", 123),
    ],
)
def test_versioned_file__parses_properly(
    input_filename: str,
    expected_base_name: str,
    expected_extension: str,
    expected_version: int | None,
) -> None:
    result = VersionedFile.from_filename(input_filename)
    assert result.base_name == expected_base_name
    assert result.extension == expected_extension
    assert result.version == expected_version


@pytest.mark.parametrize(
    "input_filename",
    [
        "test.txt?v=abc",
        "test.txt?v=1.2",
        "test.txt?v=1&v=2",
    ],
)
def test_versioned_file__raises_on_invalid_filename(input_filename: str) -> None:
    with pytest.raises(
        ValueError, match=re.escape(f"Invalid file name: {input_filename}")
    ):
        VersionedFile.from_filename(input_filename)


@pytest.mark.parametrize(
    ("input_filename", "next_version"),
    [
        ("test.txt", DEFAULT_INCREMENTED_FILE_VERSION),
        ("test.txt?v=1", 2),
        ("test.txt?v=123", 124),
    ],
)
def test_versioned_file__increment_version__pass(
    input_filename: str,
    next_version: int,
) -> None:
    result = VersionedFile.from_filename(input_filename)
    assert result.get_next_version() == next_version


@pytest.mark.parametrize(
    (
        "base_name",
        "extension",
        "version",
        "expected_filename",
        "expected_resolved_filename",
    ),
    [
        (
            "test",
            ".txt",
            None,
            "test.txt",
            f"test.txt?v={DEFAULT_INCREMENTED_FILE_VERSION}",
        ),
        ("test", ".txt", 1, "test.txt", "test.txt?v=1"),
        ("test", ".png", 123, "test.png", "test.png?v=123"),
    ],
)
def test_versioned_file__to_filename__pass(
    base_name: str,
    extension: str,
    version: int | None,
    expected_filename: str,
    expected_resolved_filename: str,
) -> None:
    result = VersionedFile(base_name, extension, version)
    assert result.full_name == expected_filename
    assert result.resolved_full_name == expected_resolved_filename

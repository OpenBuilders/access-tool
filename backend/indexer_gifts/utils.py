import re

COLLECTION_SLUG_REGEX = re.compile(r"(?P<collection_slug>.*)-[0-9]*")


def parse_collection_slug_from_gift_slug(gift_slug: str) -> str | None:
    """
    Parses the collection slug from a given gift slug using a regular expression.

    This function attempts to extract the collection slug from the provided
    gift slug string, using a predefined regular expression pattern. If the
    pattern matches, it returns the captured group corresponding to the
    collection slug. If there is no match, it returns None.

    :param gift_slug: The slug string from which the collection slug is to be
        extracted.
    :return: The extracted collection slug if a match is found, or None
        otherwise.
    """
    match = COLLECTION_SLUG_REGEX.match(gift_slug)
    if match:
        return match.group("collection_slug")
    return None

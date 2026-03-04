from typing import Annotated

from pydantic import PlainSerializer

StringifiedInt = Annotated[
    int, PlainSerializer(lambda x: str(x), return_type=str, when_used="json")
]

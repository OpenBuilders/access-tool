from typing import Annotated

from pydantic import PlainSerializer, AfterValidator
from pytonapi.utils import to_amount, to_nano

from api.utils import get_cdn_absolute_url

AmountFacadeField = Annotated[
    int | None, PlainSerializer(lambda v: to_amount(v) if v else v)
]
AmountInputField = Annotated[int, AfterValidator(lambda v: to_nano(v))]

CDNImageField = Annotated[
    str | None, PlainSerializer(lambda v: get_cdn_absolute_url(v))
]

from pydantic import field_validator
from pytonapi.utils import to_nano

from api.pos.base import BaseThresholdFilterPO


class JettonThresholdFiltersPO(BaseThresholdFilterPO):
    @classmethod
    @field_validator("threshold")
    def convert_to_nano(cls, value: int) -> int:
        if not value:
            return value

        return to_nano(value)

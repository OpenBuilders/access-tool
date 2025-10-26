from api.pos.base import BaseFDO


class PaginationMetadataFDO(BaseFDO):
    total_count: int | None

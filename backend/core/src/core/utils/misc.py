from itertools import islice
from typing import Iterable, Any


def batched(it: Iterable[Any], size: int) -> Iterable[list[Any]]:
    """
    Splits an iterable into batches of the specified size. Each batch is returned
    as a list. The function continues splitting until the iterable is exhausted.
    If the number of remaining items is less than the requested batch
    size, the final batch will contain all remaining items.

    :param it: The input iterable to split into batches.
    :param size: The desired size of each batch.
    :return: An iterable that yields lists, where each list represents a batch
             of the specified size.
    """
    it = iter(it)
    while chunk := list(islice(it, size)):
        yield chunk

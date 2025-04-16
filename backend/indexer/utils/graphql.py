from pathlib import Path

from gql import gql
from graphql import DocumentNode


def get_gql_by_name(name: str) -> DocumentNode:
    path = Path(__file__).parent.parent / "data" / "graphql" / f"{name}.graphql"
    if not path.exists():
        raise FileNotFoundError(f"File {path!r} not found.")

    with open(path, "r") as f:
        f.seek(0)
        return gql(f.read())

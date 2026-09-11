from typing import TypeVar

from pydantic import BaseModel

SearchParams = TypeVar("SearchParams", bound=BaseModel)
RowModel = TypeVar("RowModel", bound=BaseModel)

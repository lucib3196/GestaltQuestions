from pydantic import BaseModel


class PageRange(BaseModel):
    start_page: int
    end_page: int

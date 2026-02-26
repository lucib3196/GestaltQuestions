from typing import List, Any, Optional
from pydantic import BaseModel
from pathlib import Path


class FileData(BaseModel):
    filename: str
    content: dict | str | Any | bytes
    mime_type: str = "application/octet-stream"


class FilesData(BaseModel):
    files: List[FileData]


class SuccessFileServiceResponse(BaseModel):
    status: int
    detail: Optional[str | Path] = None
    path: str

from pydantic import BaseModel, ConfigDict, Field


class GDriveFile(BaseModel):
    id: str
    name: str
    mimeType: str
    parents: list[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")



from pydantic import BaseModel, Field
from typing import Literal, Dict
import json

Language = Literal["javascript", "python"]


# The configg base is what the user specifies in the folder, the actual payload is constructed during
# Loading of the files this must reference the code_sandbox/src/services/code_runner/models.py Ideally
# It would be a shared module but not sure how to handle that
class RunTimeConfigBase(BaseModel):
    entry: str = Field(
        ..., description="Entry file to execute (e.g. server.py, server.js, main.py)"
    )
    func_name: str = Field(
        default="generate",
        description="Function to actually execute defaults to generate()",
    )
    language: Language = Field(
        ..., description="The allowed runtimes currently only javascript and python"
    )


class RuntimeExecutionConfig(RunTimeConfigBase):
    files: Dict[str, str] = Field(
        default_factory=dict, description="The content of the files"
    )


class RuntimePackageConfig(BaseModel):
    default_language: Language | None = Field(
        description="The default language for runtimes", default=None
    )
    runtimes: Dict[Language, RunTimeConfigBase]


if __name__ == "__main__":
    print(json.dumps(RuntimePackageConfig.model_json_schema(), indent=2))

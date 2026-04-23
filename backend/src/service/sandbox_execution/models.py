from pydantic import BaseModel, Field
from typing import Literal, Dict, List
from pathlib import Path


class RunTimeConfig(BaseModel):
    entry: str = Field(
        ..., description="Entry file to execute (e.g. server.py, server.js, main.py)"
    )
    included_files: List[str]
    language: Literal["python", "javascript"] = Field(
        ..., description="The allowed runtimes currently only javascript and python"
    )


class RunTimePayload(RunTimeConfig):
    files: Dict[str, str] = Field(default={}, description="The content of the files")


def format_module(source: str) -> RunTimePayload:
    # For now treat it as a path based tool
    src = Path(source)
    if not src.exists():
        raise ValueError("Path is not valid")
    # Check configuration
    config = src / "config.json"
    # Future add default configuration if it does not exist
    if not config.exists():
        raise ValueError("Configuration must be present")
    try:
        run_time_config = RunTimeConfig.model_validate(
            json.loads(config.read_text(encoding="utf-8"))
        )
    except Exception as e:
        raise ValueError("Run time configuration is not valid")
    files = {}
    for f in run_time_config.included_files:
        f_included = src / f
        if f_included.exists():
            files[f] = f_included.read_text()
        else:
            print("Failed to find file skipping")
    payload = RunTimePayload(**run_time_config.model_dump(), files=files)
    return payload


if __name__ == "__main__":
    from pathlib import Path
    import json

    source = "src/service/sandbox_execution/test_question"

    print(format_module(source))

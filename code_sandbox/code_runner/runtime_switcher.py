from typing import Literal, Sequence
from code_runner import JavaScriptRunner, PythonScriptRunner, CodeRunner
from pydantic import BaseModel, Field

from code_runner.models import ExecutionResult
from code_runner.base import CodeRunner
from api.core import logger


class Generator(BaseModel):
    runner: CodeRunner = Field(
        ..., description="A function that executes code for the runtime"
    )
    extensions: Sequence[str] = Field(
        ..., description="Supported file extensions for the runtim"
    )


GENERATOR_MAPPING = {
    "python": Generator(runner=PythonScriptRunner(), extensions=[".py"]),
    "javascript": Generator(runner=JavaScriptRunner(), extensions=[".mjs", ".js"]),
}


def run_generate(
    code: str, language: Literal["python", "javascript"]
) -> ExecutionResult:
    try:
        generator = Generator[language]
        runner = generator.runner
        valid_extensions = generator.extensions

        logger.info(f"[Runtime Switcher] Running {runner} from {language}")
        return runner.run(code)
    except Exception as e:
        logger.exception(
            f"[Runtime Switcher] Unexpected error during {language} execution | '"
        )
        raise ValueError(f"Failed to execute code {code} ")

from typing import Literal, Sequence
from src.services.code_runner.javascript_runner import JavaScriptRunner
from src.services.code_runner.python_runner import PythonScriptRunner
from src.services.code_runner.base import CodeRunner
from pydantic import BaseModel, Field, ConfigDict

from src.services.code_runner.models import ExecutionResult
from src.services.code_runner.base import CodeRunner
from src.core import logger


class Generator(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    runner: CodeRunner = Field(
        ...,
        description="The runtime executor responsible for running code.",
    )
    extensions: Sequence[str] = Field(
        ...,
        description="File extensions supported by this runtime.",
    )


GENERATOR_MAPPING = {
    "python": Generator(runner=PythonScriptRunner(), extensions=[".py"]),
    "javascript": Generator(runner=JavaScriptRunner(), extensions=[".mjs", ".js"]),
}


def run_generate(
    code: str, language: Literal["python", "javascript"]
) -> ExecutionResult:
    try:
        generator = GENERATOR_MAPPING[language]
        runner = generator.runner
        valid_extensions = generator.extensions

        logger.info(f"[Runtime Switcher] Running {runner} from {language}")
        output = runner.run(code)
        logger.info("This is the output %s", output)
        return output
    except Exception as e:
        logger.exception(
            f"[Runtime Switcher] Unexpected error during {language} execution | '"
        )
        raise ValueError(f"Failed to execute code {e} ")

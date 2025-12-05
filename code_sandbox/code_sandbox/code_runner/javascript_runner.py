from pathlib import Path
import subprocess
import json
import tempfile
from typing import Dict, Any
from code_sandbox.code_runner.base import CodeRunner
from code_sandbox.code_runner.models import ExecutionResult
from code_sandbox.api.core.logger import logger
import os
from .error_handling import ExecutionError


class JavaScriptRunner(CodeRunner):
    def __init__(self, func_name: str = "generate", suffix: str = ".js"):

        self.func_name = func_name
        self.suffix = suffix

    def prepare_code(self, content):
        if "module.exports" not in content:
            content += f"\nmodule.exports = {{ {self.func_name} }};"
        return content

    def prepare_runner(self, tmp_path_posix, payload: Dict[str, Any] = {}):
        node_runner = f"""\
        const mod = require("{tmp_path_posix}");
        const input = {json.dumps(payload)};
        const result = mod["{self.func_name}"](input);
        console.log(JSON.stringify(result));
        """
        return node_runner

    def run(self, code: str, payload: Dict[str, Any] = {}) -> ExecutionResult:
        code_content = self.prepare_code(code)

        try:
            # This needs to be refactored at some point
            env = os.environ.copy()
            env["NODE_PATH"] = "/app/node_modules:/usr/lib/node_modules"

            tmp_dir = Path("/app/tmp")
            if not tmp_dir.exists():
                # Local: use system tmp dir instead
                tmp_dir = Path(tempfile.gettempdir())

            cwd_path = Path("/app")
            if not cwd_path.exists():
                cwd_path = Path().resolve()  # local working directory
        except Exception as e:
            raise ExecutionError(
                f"Failed to set up environemt for javascript execution {e}"
            )

        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                delete=False,
                suffix=self.suffix,
                dir=tmp_dir,
                errors="replace",
                encoding="utf-8",
            ) as tmp:
                tmp.write(code_content)
                tmp_path = tmp.name
            tmp_path_posix = Path(tmp_path).resolve().as_posix()
        except UnicodeError as e:
            raise ExecutionError(
                f"Could not execute code received a Unicode failure during execution: Error {e} "
            )

        node_runner = self.prepare_runner(tmp_path_posix, payload)
        try:
            result = subprocess.run(
                ["node", "-e", node_runner],
                cwd=cwd_path,
                capture_output=True,
                text=True,
                timeout=5,
                check=True,
            )
        except subprocess.CalledProcessError as e:
            raise ExecutionError(
                f"Execution of JavaScript File failed\nstderr: {e.stderr}"
            )
        except subprocess.TimeoutExpired:
            raise ExecutionError("JavaScript execution timed out")
        except Exception as e:
            raise ValueError(f"Could not run javascript code {e}")

        stdout = result.stdout.strip()
        stderr = result.stderr.strip()

        # Extract last JSON line (supports other console.logs)
        last_line = stdout.splitlines()[-1]
        print_statements = stdout.splitlines()[:-1]

        try:
            parsed = json.loads(last_line)
            return ExecutionResult(output=parsed, logs=print_statements)
        except Exception as e:
            raise ValueError(
                f"Failed to parse JS output. Error: {e}\n"
                f"Raw stdout:\n{stdout}\n"
                f"Raw stderr:\n{stderr}"
            )


if __name__ == "__main__":
    path = Path(r"app_test/test_code/generate.js").resolve()
    javascript_runner = JavaScriptRunner()
    print("result", javascript_runner.run(code=path.read_text()))

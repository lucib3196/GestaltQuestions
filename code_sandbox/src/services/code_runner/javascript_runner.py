import json
import os
from pathlib import Path
import subprocess
from subprocess import CompletedProcess
import tempfile

from src.services.code_runner.base import CodeRunner
from src.services.code_runner.models import (
    ExecutionResult,
    Language,
    RuntimeExecutionConfig,
)

from .error_handling import ExecutionError


class JavaScriptRunner(CodeRunner):
    """Runs JavaScript code from a runtime execution configuration."""

    def __init__(
        self, runtime_config: RuntimeExecutionConfig, language: Language = "javascript"
    ):
        """Initialize runner and prime environment and entry-point exports."""
        super().__init__(runtime_config, language)
        self._initialize_env()
        self._ensure_entry_exports_function()

    def run(self) -> ExecutionResult:
        """Execute JavaScript and return parsed output plus captured logs."""
        raw_results = self.execute()

        if raw_results.returncode != 0:
            raise ExecutionError(f"JavaScript execution crashed:\n{raw_results.stderr}")

        stdout = raw_results.stdout.strip()
        stderr = raw_results.stderr.strip()

        # Last line is expected to be JSON output; prior lines are console logs.
        last_line = stdout.splitlines()[-1] or ""
        print_statements = stdout.splitlines()[:-1]

        try:
            parsed = json.loads(last_line)
        except json.JSONDecodeError as e:
            raise ExecutionError(
                f"Failed to parse JavaScript output as JSON: {e}\n"
                f"Raw stdout:\n{stdout}\n"
                f"Raw stderr:\n{stderr}"
            )

        if "error" in parsed:
            raise ExecutionError(f"JavaScript execution error: {parsed['error']}")

        return ExecutionResult(output=parsed, logs=print_statements)

    def execute(self) -> CompletedProcess:
        """Create an isolated temp workspace, write files, and run Node."""
        tmp_dir_name = self._get_temp_dir_name()

        with tempfile.TemporaryDirectory(prefix="runner_", dir=tmp_dir_name) as tmp_dir:
            tmp_path = Path(tmp_dir)

            # Persist all runtime files in the temp workspace.
            for filename, content in self.runtime_config.files.items():
                (tmp_path / filename).write_text(content, encoding="utf-8")

            entry_point = tmp_path / self.runtime_config.entry
            runner = self._build_runner_script(entry_point)

            try:
                result = subprocess.run(
                    ["node", "-e", runner],
                    cwd=tmp_path,
                    capture_output=True,
                    text=True,
                    timeout=5,
                    check=True,
                    env=self._env
                )
            except subprocess.CalledProcessError as e:
                raise ExecutionError(
                    "JavaScript subprocess failed while executing "
                    f"'{self.runtime_config.entry}'. stderr: {e.stderr}"
                )
            except subprocess.TimeoutExpired:
                raise ExecutionError("JavaScript execution timed out after 5 seconds.")
            except Exception as e:
                raise ExecutionError(
                    f"Unexpected failure while running JavaScript subprocess: {e}"
                )

        return result

    def _ensure_entry_exports_function(self) -> None:
        """Ensure the entry file exports the configured function name."""
        code = self._get_entry_point()
        if "module.exports" not in code:
            code += f"\nmodule.exports = {{ {self.runtime_config.func_name} }};"
        self._update_entry_point(code)

    def _build_runner_script(self, entry_point_path: str | Path) -> str:
        """Build inline Node script that requires and calls the entry module."""
        if isinstance(entry_point_path, Path):
            entry_point_path = entry_point_path.as_posix()

        runner = """
        const mod = require("%(path)s");
        let result;
        result = mod["%(func)s"]();
        console.log(JSON.stringify(result));
        """ % {
            "path": entry_point_path,
            "func": self.runtime_config.func_name,
        }
        return runner

    def _initialize_env(self) -> None:
        """Build environment variables used by the Node subprocess."""
        env = os.environ.copy()
        env["NODE_PATH"] = "/app/node_modules:/usr/lib/node_modules"
        self._env = env

    def _get_temp_dir_name(self) -> str:
        """Return preferred temp directory path, with local fallback."""
        tmp_dir_path = Path("/app/tmp")
        if not tmp_dir_path.exists():
            tmp_dir_path = Path(tempfile.gettempdir())
        return tmp_dir_path.as_posix()


if __name__ == "__main__":
    path = Path(r"../app_test/assets/generate.js").resolve()
    config = RuntimeExecutionConfig(
        entry="server.js",
        language="javascript",
        files={"server.js": path.read_text(encoding="utf-8")},
    )

    javascript_runner = JavaScriptRunner(config)
    print(javascript_runner.run())
    # print("result", javascript_runner.run(code=path.read_text()))

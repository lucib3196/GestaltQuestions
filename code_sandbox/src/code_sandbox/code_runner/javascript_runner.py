from pathlib import Path
import subprocess
import json
import tempfile
from typing import Dict, Any
from src.code_sandbox.code_runner.base import CodeRunner
from src.code_sandbox.code_runner.models import ExecutionResult


class JavaScriptRunner(CodeRunner):
    def __init__(self, func_name: str = "generate", suffix: str = ".js"):

        self.func_name = func_name
        self.suffix = suffix

    def prepare_code(self, content):
        if "module.exports" not in content:
            content += f"\nmodule.exports = {{ {self.func_name} }};"
        return content

    def prepare_runner(self, tmp_path_posix, payload: Dict[str, Any] = {}):
        node_runner = f"""
        const mod = require("{tmp_path_posix}");
        const input = {json.dumps(payload)};
        const result = mod['{self.func_name}'](input);
        console.log(JSON.stringify({{result}}));
        """
        return node_runner

    def run(self, code: str, payload: Dict[str, Any] = {}) -> ExecutionResult:
        code_content = self.prepare_code(code)
        with tempfile.NamedTemporaryFile(
            mode="w", delete=False, suffix=self.suffix
        ) as tmp:
            tmp.write(code_content)
            tmp_path = tmp.name
        tmp_path_posix = Path(tmp_path).as_posix()
        node_runner = self.prepare_runner(tmp_path_posix, payload)

        try:
            result = subprocess.run(
                ["node", "-e", node_runner],
                capture_output=True,
                text=True,
                timeout=5,
            )
        except subprocess.TimeoutExpired:
            raise ValueError("JavaScript execution timed out")
        except Exception as e:
            raise ValueError(f"Could not run javascript code {e}")

        stdout = result.stdout.strip()
        stderr = result.stderr.strip()

        if not stdout:
            raise ValueError("JavaScript script returned no output")

        # Extract last JSON line (supports other console.logs)
        last_line = stdout.splitlines()[-1]
        print_statements = stdout.splitlines()[:-1]
        try:
            parsed = json.loads(last_line)
            result = parsed.get("result")
            if not result:
                raise ValueError("Result is none")
            return ExecutionResult(output=result, logs=print_statements)
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

from pathlib import Path
from code_sandbox.code_runner.javascript_runner import JavaScriptRunner

if __name__ == "__main__":
    path = Path(r"app_test/assets/generateWrong.js").resolve()
    javascript_runner = JavaScriptRunner()
    print(
        "result",
        javascript_runner.run(code=path.read_text(encoding="utf-8", errors="replace")),
    )

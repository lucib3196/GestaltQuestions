import pytest
from pathlib import Path

from src.code_sandbox.code_runner.models import ExecutionResult
from src.code_sandbox.code_runner.runtime_switcher import run_generate


# --- Fixtures ---
@pytest.fixture(params=["js_script_path", "py_script_path"])
def script_path(request):
    """Fixture: dynamically selects between JS and Python script fixtures."""
    language = "javascript" if request.param == "js_script_path" else "python"
    path = request.getfixturevalue(request.param)
    return path, language


@pytest.fixture(params=["js_script_path", "py_script_path"])
def script_path_wrong(request):
    """Fixture: intentionally mismatched language and file combination."""
    language = "python" if request.param == "js_script_path" else "javascript"
    path = request.getfixturevalue(request.param)
    return path, language


@pytest.fixture
def executed_response(script_path):
    """Fixture: executes the runtime switcher for the given language."""
    path, language = script_path
    code = Path(path).read_text()
    resp = run_generate(code, language)
    response = ExecutionResult.model_validate(resp)
    assert response
    return response


# --- Tests ---
def test_execution_success(executed_response):
    """Ensure valid script executes successfully."""
    resp = executed_response
    assert resp.output
    assert resp.logs

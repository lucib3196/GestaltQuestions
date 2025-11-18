# --- Standard Library ---
from pathlib import Path

# --- Third-Party ---
import pytest
import json

# --- Internal Modules ---
from code_runner.python_runner import PythonScriptRunner
from code_runner.models import ExecutionResult
from utils.utils import logs_contain


# --------------------------------------------------------------------------- #
# Fixtures
# --------------------------------------------------------------------------- #


@pytest.fixture
def py_execution_result(py_script_path):
    """Run the Python script and return a validated CodeRunResponse."""
    code = Path(py_script_path).read_text()
    runner = PythonScriptRunner()
    raw_result = runner.run(code)

    response = ExecutionResult.model_validate(raw_result)
    assert response is not None

    return response


# --------------------------------------------------------------------------- #
# Tests
# --------------------------------------------------------------------------- #


def test_py_execution_success(py_execution_result):
    """Verify the Python script executed successfully and produced output."""
    resp = py_execution_result
    assert ExecutionResult.model_validate(resp)
    assert resp is not None


def test_py_execution_returns_quiz_response(py_execution_result):
    """Verify that the Python script returned correct structured quiz output."""
    output = py_execution_result.output

    assert output
    if isinstance(output, str):
        output = json.loads(output)

    assert isinstance(output, dict)

    assert output["params"] == {"a": 1, "b": 2}
    assert output["correct_answers"]["sum"] == 3


def test_py_execution_logs_expected_output(py_execution_result):
    """Verify console logs include expected values and structure."""
    logs = py_execution_result.logs

    # Basic value logs
    assert logs_contain(logs, "This is the value of a", "1")
    assert logs_contain(logs, "This is the value of b", "2")

    # Structure logs (Python repr form)
    assert logs_contain(logs, "This is a structure", "'params'")
    assert logs_contain(logs, "This is a structure", "'a'", "1")
    assert logs_contain(logs, "This is a structure", "'b'", "2")

import pytest
from fastapi.testclient import TestClient
from pathlib import Path

from code_sandbox.api.main import get_app


# --------------------------------------------------------------------------- #
# Fixtures
# --------------------------------------------------------------------------- #

@pytest.fixture(scope="function")
def test_client():
    """Provide a FastAPI TestClient instance."""
    app = get_app()
    with TestClient(app, raise_server_exceptions=True) as client:
        yield client


@pytest.fixture(params=["js_script_path", "py_script_path"])
def generated_response(test_client, request):
    """
    Runs the /code_runner/generate endpoint for both JavaScript and Python code.
    Returns the response.
    """
    # Determine language based on which fixture is used
    language = "javascript" if request.param == "js_script_path" else "python"

    # Load code from the given file path fixture
    path = request.getfixturevalue(request.param)
    code = Path(path).read_text()

    # Build JSON request payload
    payload = {
        "language": language,
        "code": code,
    }

    # Call the API
    resp = test_client.post("/code_runner/generate", json=payload)

    # Basic response checks
    assert resp.status_code == 200, resp.text
    assert resp.json() is not None
    return resp.json()


# --------------------------------------------------------------------------- #
# Test
# --------------------------------------------------------------------------- #

def test_generate_runs_for_both_languages(generated_response):
    """Ensure code execution works for both JavaScript and Python."""
    assert "output" in generated_response
    assert "logs" in generated_response

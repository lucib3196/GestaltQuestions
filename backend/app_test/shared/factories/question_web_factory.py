import pytest
from src.types import QuestionData
from uuid import UUID


@pytest.fixture
def make_question_web(api_client):
    def make(**overrides):
        defaults = {
            "title": "Sample Question",
            "ai_generated": True,
            "isAdaptive": False,
        }

        data = QuestionData(**(defaults | overrides))
        return api_client.post("/questions/", data=data.model_dump_json())

    return make


@pytest.fixture
def make_bad_question_web(api_client):
    def make(**overrides):
        defaults = {"missing": "data", "another": "bad_key"}
        data = {**defaults | overrides}
        return api_client.post("/questions/", json=data)

    return make


@pytest.fixture
def make_retrieve_question(api_client):
    def make(qid: str | UUID):
        return api_client.get(f"/questions/{qid}")

    return make


@pytest.fixture
def make_delete_question(api_client):
    def make(qid: str | UUID):
        return api_client.delete(f"/questions/{qid}")
    return make


@pytest.fixture
def make_retrieve_question_full(api_client):
    def make(qid: str | UUID):
        return api_client.get(f"/questions/{qid}/all_data")

    return make

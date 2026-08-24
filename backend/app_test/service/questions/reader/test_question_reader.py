from uuid import uuid4

import pytest

from app_test.factories.question_factory import MakeQuestion
from app_test.support.developer import DeveloperActor
from backend.accounts import Role, UserRoles, ValidInstitutions
from backend.question import QuestionNotFoundError, QuestionReadError
from backend.question.models import Question
from backend.question.reader.question_reader import QuestionReader
from backend.question_runtime.model import QuestionRunTime, RuntimeLanguage


@pytest.fixture
def reader(db_session) -> QuestionReader:
    return QuestionReader(db_session)


@pytest.fixture
def owner(make_user, make_developer_profile) -> DeveloperActor:
    user = make_user(
        email="dev1@gmail.com",
        roles=[Role(name=UserRoles.DEVELOPER.value)],
        institution=ValidInstitutions.UCR,
    )
    profile = make_developer_profile(user)
    return DeveloperActor(user=user, profile=profile)


def test_get_question_info_includes_expected_fields(
    reader: QuestionReader,
    make_question: MakeQuestion,
):
    question = make_question(title="Reader Question")

    data = reader.get_question_info(question)

    assert data.id == question.id
    assert data.title == "Reader Question"
    assert data.topic == ["math"]
    assert data.qType == ["mc"]
    assert data.createdBy == ""
    assert data.institution == ""
    assert data.codelang == []


def test_get_question_info_includes_owner_fields(
    reader: QuestionReader,
    make_question: MakeQuestion,
    owner: DeveloperActor,
):
    question = make_question(owner.profile, title="Owned Reader Question")

    data = reader.get_question_info(question)

    assert data.id == question.id
    assert data.title == "Owned Reader Question"
    assert data.createdBy == "dev1@gmail.com"
    assert data.institution == ValidInstitutions.UCR


def test_get_question_info_includes_runtime_languages(
    db_session,
    reader: QuestionReader,
    make_question: MakeQuestion,
):
    question = make_question(title="Runtime Reader Question")
    assert question.id is not None

    db_session.add(
        QuestionRunTime(
            question_id=question.id,
            language=RuntimeLanguage.PYTHON,
            entry="generate.py",
            is_default=True,
            enabled=True,
        )
    )
    db_session.add(
        QuestionRunTime(
            question_id=question.id,
            language=RuntimeLanguage.JAVASCRIPT,
            entry="generate.js",
            is_default=False,
            enabled=True,
        )
    )
    db_session.commit()

    data = reader.get_question_info(question)

    assert isinstance(data.codelang, list)
    assert set(data.codelang) == {
        RuntimeLanguage.PYTHON,
        RuntimeLanguage.JAVASCRIPT,
    }


def test_get_question_raises_not_found_for_missing_id(reader: QuestionReader):
    missing_id = uuid4()

    with pytest.raises(QuestionNotFoundError, match=str(missing_id)):
        reader.get_question(missing_id)


def test_get_question_info_raises_not_found_for_missing_id(reader: QuestionReader):
    missing_id = uuid4()

    with pytest.raises(QuestionNotFoundError, match=str(missing_id)):
        reader.get_question_info(missing_id)


def test_get_question_raises_read_error_for_unsaved_question_instance(
    reader: QuestionReader,
):
    question = Question(title="Unsaved question")
    question.id = None

    with pytest.raises(QuestionReadError, match="does not have an id"):
        reader.get_question(question)

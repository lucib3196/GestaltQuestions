import pytest

from app_test.factories.question_factory import MakeQuestion
from backend.authorization import AccessLevel
from backend.developer.tables.shared_questions import DeveloperSharedQuestionTables
from backend.question.access import QuestionAccess


@pytest.fixture
def shared_table(db_session):
    return DeveloperSharedQuestionTables(db_session)


def share_question(db_session, *, question_id, granted_by_id, developer_id):
    access = QuestionAccess(
        question_id=question_id,
        granted_by_id=granted_by_id,
        developer_id=developer_id,
        access_level=AccessLevel.VIEW,
    )
    db_session.add(access)
    db_session.commit()
    return access


def test_search_shared_with_me_returns_questions_granted_to_developer(
    shared_table,
    db_session,
    dev_owner,
    dev_other,
    make_question: MakeQuestion,
) -> None:
    shared_question = make_question(dev_owner.profile, title="Shared With Me")
    private_question = make_question(dev_owner.profile, title="Private Question")

    share_question(
        db_session,
        question_id=shared_question.id,
        granted_by_id=dev_owner.profile.id,
        developer_id=dev_other.profile.id,
    )

    rows = shared_table.search_shared_with_me(dev_other.profile)

    question_ids = {row.question_id for row in rows}
    assert question_ids == {shared_question.id}
    assert private_question.id not in question_ids
    assert rows[0].granted_by_email == dev_owner.user.email
    assert rows[0].granted_to_emails == [dev_other.user.email]
    assert rows[0].access_levels == [AccessLevel.VIEW]


def test_search_shared_by_me_returns_questions_granted_by_developer(
    shared_table,
    db_session,
    dev_owner,
    dev_other,
    make_question: MakeQuestion,
) -> None:
    shared_question = make_question(dev_owner.profile, title="Shared By Me")
    unshared_question = make_question(dev_owner.profile, title="Unshared Question")

    share_question(
        db_session,
        question_id=shared_question.id,
        granted_by_id=dev_owner.profile.id,
        developer_id=dev_other.profile.id,
    )

    rows = shared_table.search_shared_by_me(dev_owner.profile)

    question_ids = {row.question_id for row in rows}
    assert question_ids == {shared_question.id}
    assert unshared_question.id not in question_ids
    assert rows[0].granted_by_email == dev_owner.user.email
    assert rows[0].granted_to_emails == [dev_other.user.email]
    assert rows[0].member_ids == [dev_other.user.id]
    assert rows[0].access_levels == [AccessLevel.VIEW]

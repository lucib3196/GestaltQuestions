import pytest

from app_test.factories.question_factory import MakeQuestion
from backend.developer.tables.published import DeveloperPublishedQuestionTables
from backend.question import Status
from backend.question.views.schema import QuestionSearchParams


@pytest.fixture
def published_table(db_session):
    return DeveloperPublishedQuestionTables(db_session)


def test_search_published_questions_returns_only_published_questions(
    published_table,
    dev_owner,
    dev_other,
    make_question: MakeQuestion,
) -> None:
    published_owner = make_question(
        dev_owner.profile,
        title="Published Owner Question",
        status=Status.PUBLISHED,
    )
    published_other = make_question(
        dev_other.profile,
        title="Published Other Question",
        status=Status.PUBLISHED,
    )
    draft = make_question(
        dev_owner.profile,
        title="Draft Question",
        status=Status.DRAFT,
    )

    rows = published_table.search_published_questions()

    question_ids = {row.question_id for row in rows}
    assert question_ids == {published_owner.id, published_other.id}
    assert draft.id not in question_ids


def test_search_published_questions_applies_search_filter(
    published_table,
    dev_owner,
    make_question: MakeQuestion,
) -> None:
    match = make_question(
        dev_owner.profile,
        title="Projectile Published Question",
        status=Status.PUBLISHED,
    )
    make_question(
        dev_owner.profile,
        title="Thermodynamics Published Question",
        status=Status.PUBLISHED,
    )

    rows = published_table.search_published_questions(
        QuestionSearchParams(search="Projectile")
    )

    assert len(rows) == 1
    assert rows[0].question_id == match.id
    assert rows[0].title == "Projectile Published Question"

import pytest

from app_test.factories.question_factory import MakeQuestion
from backend.developer.tables.personal_questions import DeveloperPersonalQuestionTables
from backend.question import QType, Status
from backend.question.views.schema import QuestionSearchParams


@pytest.fixture
def personal_table(db_session):
    return DeveloperPersonalQuestionTables(db_session)


def test_search_my_questions_returns_only_owner_questions(
    personal_table,
    dev_owner,
    dev_other,
    make_question: MakeQuestion,
) -> None:
    first = make_question(dev_owner.profile, title="Owner Question 1")
    second = make_question(dev_owner.profile, title="Owner Question 2")
    other = make_question(dev_other.profile, title="Other Developer Question")

    rows = personal_table.search_my_questions(dev_owner.profile)

    question_ids = {row.question_id for row in rows}
    assert question_ids == {first.id, second.id}
    assert other.id not in question_ids


def test_search_my_questions_applies_table_filters(
    personal_table,
    dev_owner,
    make_question: MakeQuestion,
) -> None:
    match = make_question(
        dev_owner.profile,
        title="Projectile Motion",
        status=Status.PUBLISHED,
        topics=["physics"],
        qType=[QType.NUM],
        isAdaptive=False,
    )
    make_question(
        dev_owner.profile,
        title="Beam Stress",
        status=Status.DRAFT,
        topics=["mechanics"],
        qType=[QType.MC],
        isAdaptive=True,
    )

    rows = personal_table.search_my_questions(
        dev_owner.profile,
        QuestionSearchParams(
            search="Projectile",
            status=Status.PUBLISHED,
            qtype=QType.NUM,
            isAdaptive=False,
        ),
    )

    assert len(rows) == 1
    assert rows[0].question_id == match.id
    assert rows[0].title == "Projectile Motion"
    assert rows[0].topics == ["physics"]
    assert rows[0].question_type == [QType.NUM]


@pytest.mark.asyncio
async def test_search_questions_in_collections_returns_selected_collection_questions(
    personal_table,
    developer_collection_service,
    dev_owner,
    make_question: MakeQuestion,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Practice",
    )
    first = make_question(dev_owner.profile, title="Collection Question 1")
    second = make_question(dev_owner.profile, title="Collection Question 2")
    unrelated = make_question(dev_owner.profile, title="Unrelated Question")

    await developer_collection_service.add_question(
        dev_owner.user, collection.id, first.id
    )
    await developer_collection_service.add_question(
        dev_owner.user, collection.id, second.id
    )

    rows = personal_table.search_questions_in_collections(
        dev_owner.profile,
        QuestionSearchParams(collection_id=collection.id),
    )

    question_ids = {row.question_id for row in rows}
    assert question_ids == {first.id, second.id}
    assert unrelated.id not in question_ids

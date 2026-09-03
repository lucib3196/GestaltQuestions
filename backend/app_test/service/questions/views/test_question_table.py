from uuid import uuid4

from app_test.factories.question_factory import MakeQuestion
from backend.question import QType, Status
from backend.question.views.schema import QuestionSearchParamsBase, QuestionTableRowBase
from backend.question.views.services.question_table import QuestionTable
from backend.question_runtime.model import QuestionRunTime, RuntimeLanguage


def add_runtime(db_session, question_id, language: RuntimeLanguage) -> None:
    db_session.add(
        QuestionRunTime(
            question_id=question_id,
            language=language,
            entry="generate.py",
            enabled=True,
        )
    )
    db_session.commit()


def test_search_returns_question_table_rows(
    db_session, make_question: MakeQuestion
) -> None:
    first = make_question(
        title="Projectile Motion",
        status=Status.PUBLISHED,
        topics=["physics"],
        qType=[QType.NUM],
    )
    second = make_question(
        title="Beam Stress",
        status=Status.DRAFT,
        topics=["mechanics"],
        qType=[QType.MC],
        isAdaptive=True,
    )
    add_runtime(db_session, first.id, RuntimeLanguage.PYTHON)
    add_runtime(db_session, second.id, RuntimeLanguage.JAVASCRIPT)

    rows = QuestionTable(db_session).search()

    assert {row.question_id for row in rows} == {first.id, second.id}
    assert all(isinstance(row, QuestionTableRowBase) for row in rows)


def test_search_filters_by_base_params(db_session, make_question: MakeQuestion) -> None:
    match = make_question(
        title="Projectile Motion",
        status=Status.PUBLISHED,
        topics=["physics"],
        qType=[QType.NUM],
        isAdaptive=False,
    )
    make_question(
        title="Beam Stress",
        status=Status.DRAFT,
        topics=["mechanics"],
        qType=[QType.MC],
        isAdaptive=True,
    )
    add_runtime(db_session, match.id, RuntimeLanguage.PYTHON)

    rows = QuestionTable(db_session).search(
        QuestionSearchParamsBase(
            search="Projectile",
            status=Status.PUBLISHED,
            isAdaptive=False,
        )
    )

    assert len(rows) == 1
    assert rows[0].question_id == match.id
    assert rows[0].title == "Projectile Motion"
    assert rows[0].topics == ["physics"]
    assert rows[0].question_type == [QType.NUM]
    assert rows[0].available_runtimes == [RuntimeLanguage.PYTHON]


def test_search_by_id_returns_matching_question(
    db_session, make_question: MakeQuestion
) -> None:
    question = make_question(title="Specific Question")
    make_question(title="Other Question")
    assert question.id

    rows = QuestionTable(db_session).search_by_id(question.id)

    print("Rows,", rows)

    assert len(rows) == 1
    assert rows[0].question_id == question.id
    assert rows[0].title == "Specific Question"


def test_search_by_id_returns_empty_list_for_missing_question(db_session) -> None:
    rows = QuestionTable(db_session).search_by_id(uuid4())

    assert rows == []

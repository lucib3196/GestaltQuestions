import pytest

from backend.authorization import AccessLevel

SHAREABLE_ACCESS_LEVELS = [
    AccessLevel.VIEW,
    AccessLevel.EDIT,
    AccessLevel.FULL,
]


@pytest.mark.asyncio
async def test_create_question(
    developer_question_sharing,
    developer_question_service,
    dev_owner,
    student_user,
    make_question_payload,
) -> None:
    owner_user_id = dev_owner.user.id
    payload = make_question_payload()
    question = await developer_question_service.create_question(
        owner_user_id, payload=payload.question, files=payload.files
    )
    print(question)

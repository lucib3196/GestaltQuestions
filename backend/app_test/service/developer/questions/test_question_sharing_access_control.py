from typing import Literal

import pytest

from backend.authorization import AccessLevel
from backend.developer.questions import DeveloperQuestionService
from backend.question.schema import QuestionUpdate
from backend.storage import FileData


async def run_question_action(
    developer_question_service: DeveloperQuestionService,
    action: Literal[
        "get_question",
        "copy_question",
        "update_question",
        "delete_question",
        "get_question_files",
        "get_question_filedata",
        "read_file",
        "write_file",
        "delete_file",
        "upload_files",
    ],
    user_id,
    question_id,
):
    if action == "get_question":
        return await developer_question_service.get_question(user_id, question_id)

    if action == "copy_question":
        return await developer_question_service.copy_question(question_id, user_id)

    if action == "update_question":
        return await developer_question_service.update_question(
            user_id,
            question_id,
            QuestionUpdate(title="Updated shared question"),
        )

    if action == "delete_question":
        return await developer_question_service.delete_question(user_id, question_id)

    if action == "get_question_files":
        return await developer_question_service.get_question_files(
            user_id,
            question_id,
        )

    if action == "get_question_filedata":
        return await developer_question_service.get_question_filedata(
            user_id,
            question_id,
        )

    if action == "read_file":
        return await developer_question_service.read_file(
            user_id,
            question_id,
            "question.html",
        )

    if action == "write_file":
        return await developer_question_service.write_file(
            user_id,
            question_id,
            "shared-notes.txt",
            "allowed write",
        )

    if action == "delete_file":
        return await developer_question_service.delete_file(
            user_id,
            question_id,
            "solution.html",
        )

    if action == "upload_files":
        return await developer_question_service.upload_files(
            user_id,
            question_id,
            [FileData(filename="extra.txt", content="extra")],
        )

    

    raise ValueError(f"Unknown action: {action}")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("level", "action", "allowed"),
    [
        (AccessLevel.VIEW, "get_question", True),
        (AccessLevel.VIEW, "copy_question", True),
        (AccessLevel.VIEW, "update_question", False),
        (AccessLevel.VIEW, "delete_question", False),
        (AccessLevel.VIEW, "get_question_files", True),
        (AccessLevel.VIEW, "get_question_filedata", True),
        (AccessLevel.VIEW, "read_file", True),
        (AccessLevel.VIEW, "write_file", False),
        (AccessLevel.VIEW, "delete_file", False),
        (AccessLevel.VIEW, "upload_files", False),
  
        (AccessLevel.EDIT, "get_question", True),
        (AccessLevel.EDIT, "copy_question", True),
        (AccessLevel.EDIT, "update_question", True),
        (AccessLevel.EDIT, "delete_question", False),
        (AccessLevel.EDIT, "get_question_files", True),
        (AccessLevel.EDIT, "get_question_filedata", True),
        (AccessLevel.EDIT, "read_file", True),
        (AccessLevel.EDIT, "write_file", True),
        (AccessLevel.EDIT, "delete_file", True),
        (AccessLevel.EDIT, "upload_files", True),

        (AccessLevel.FULL, "get_question", True),
        (AccessLevel.FULL, "copy_question", True),
        (AccessLevel.FULL, "update_question", True),
        (AccessLevel.FULL, "delete_question", True),
        (AccessLevel.FULL, "get_question_files", True),
        (AccessLevel.FULL, "get_question_filedata", True),
        (AccessLevel.FULL, "read_file", True),
        (AccessLevel.FULL, "write_file", True),
        (AccessLevel.FULL, "delete_file", True),
        (AccessLevel.FULL, "upload_files", True),
       
    ],
)
async def test_shared_question_access_level_controls_question_actions(
    developer_question_sharing,
    developer_question_service,
    dev_owner,
    dev_other,
    make_question_payload,
    level,
    action,
    allowed,
) -> None:
    payload = make_question_payload()
    question = await developer_question_service.create_question(
        dev_owner.user.id,
        payload=payload.question,
        files=payload.files,
    )

    await developer_question_sharing.share_with_user(
        dev_owner.user.id,
        dev_other.user.id,
        question.id,
        level=level,
    )

    if allowed:
        await run_question_action(
            developer_question_service,
            action,
            dev_other.user.id,
            question.id,
        )
    else:
        with pytest.raises(Exception, match="Question access denied"):
            await run_question_action(
                developer_question_service,
                action,
                dev_other.user.id,
                question.id,
            )

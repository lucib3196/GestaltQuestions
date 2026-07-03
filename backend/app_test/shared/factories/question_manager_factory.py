from pathlib import Path
from typing import Any, Protocol

import pytest

from app_test import (
    FileData,
    Question,
    QuestionData,
    QuestionManager,
)


class MakeQuestionFactory(Protocol):
    async def __call__(
        self,
        data: dict[str, Any] | QuestionData,
        files: list[FileData] | None = None,
    ) -> tuple[Question, QuestionData]: ...


@pytest.fixture
def make_question_qm(
    question_manager: QuestionManager, tmp_path
) -> MakeQuestionFactory:

    async def make(
        data: dict[str, Any] | QuestionData, files: list[FileData] | None = None
    ) -> tuple[Question, QuestionData]:

        try:
            # Normalize input
            if isinstance(data, QuestionData):
                d = data
            else:
                d = QuestionData.model_validate(data)

            # Prepare storage path
            storage_type = question_manager.storage.get_storage_type()
            base_path = d.base_path or ""

            if storage_type == "local":
                d.base_path = Path(tmp_path / base_path).as_posix()
            elif storage_type == "cloud":
                d.base_path = f"cloud/{base_path}"

            qcreated = await question_manager.create_question(d, files)

            assert qcreated is not None
            assert isinstance(qcreated, Question)

            return qcreated, d

        except Exception as e:
            raise ValueError(f"Failed to use question_manager factory {e}") from e

    return make

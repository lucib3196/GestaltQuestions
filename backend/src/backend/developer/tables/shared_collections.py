from collections.abc import Sequence
from typing import cast

from backend.developer.model import DeveloperProfile
from backend.developer.tables.base import DeveloperTables
from backend.developer.tables.extensions.question_access import (
    QuestionAccessTableExtension,
)
from backend.developer.tables.schemas import (
    SharedByMeQuestionTableRow,
    SharedWithMeQuestionTableRow,
)
from backend.question.views.schema import QuestionSearchParams
from backend.question.views.services import QuestionTable


class DeveloperSharedQuestionTables(DeveloperTables):
    def search_shared_with_me(
        self, dev: DeveloperProfile, params: QuestionSearchParams|None = None
    ):
        assert dev.id
        
        table = QuestionTable(self._session)
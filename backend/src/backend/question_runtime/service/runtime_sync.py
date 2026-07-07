from backend.question_runtime.model import (
    QuestionRunTime,
    RuntimeConfigSource,
)
from backend.shared import ID

from .runtime_db import QuestionRuntimeDB
from .runtime_resolver import QuestionRunTimeResolver


class QuestionRunTimeSyncService:
    def __init__(
        self,
        runtime_db: QuestionRuntimeDB,
        resolver: QuestionRunTimeResolver | None = None,
    ):
        self._runtime_db = runtime_db
        self._resolver = resolver or QuestionRunTimeResolver()

    async def sync_from_files(
        self,
        question_id: ID,
        files: dict[str, str],
        *,
        overwrite_manual: bool = False,
    ) -> list[QuestionRunTime]:
        resolved = self._resolver.infer(files)
        existing = await self._runtime_db.list_question_runtimes(question_id)
        manual_languages = {
            runtime.language
            for runtime in existing
            if runtime.source == RuntimeConfigSource.MANUAL
        }
        synced = []
        for runtime in resolved:
            if runtime.language in manual_languages and not overwrite_manual:
                continue

            synced.append(await self._runtime_db.upsert(question_id, runtime))
        return synced

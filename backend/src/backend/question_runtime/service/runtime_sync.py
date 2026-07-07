from backend.question_runtime.model import (
    QuestionRunTime,
    RuntimeConfigSource,
)
from typing import List, Dict
from backend.shared import ID
from backend.storage import FileData
from .runtime_db import QuestionRuntimeDB
from .runtime_resolver import QuestionRunTimeResolver
from backend.utils import normalize_content


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
        files: dict[str, str] | List[FileData],
        *,
        overwrite_manual: bool = False,
    ) -> list[QuestionRunTime]:

        if isinstance(files, list) and all(
            isinstance(file, FileData) for file in files
        ):
            files = self._convert_filedata(files)

        resolved = self._resolver.infer(files) # type: ignore
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

    @staticmethod
    def _convert_filedata(files: List[FileData]) -> Dict[str, str]:
        data = dict()
        for f in files:
            data[f.filename] = normalize_content(f.content)
        return data

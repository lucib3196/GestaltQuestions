from typing import Annotated

from fastapi import Depends

from backend.question_runtime.service.question_runtime import QuestionRunTimeService
from backend.question_runtime.service.runtime_db import QuestionRuntimeDB
from backend.question_runtime.service.runtime_sync import QuestionRunTimeSyncService
from backend.sandbox_client import SandboxClient

from .core import SessionDep, SettingDependency
from .questions import QuestionManagerDependency


def get_sandbox(app_settings: SettingDependency) -> SandboxClient:
    return SandboxClient(base_url=app_settings.SANDBOX_URL)


SandboxDependency = Annotated[SandboxClient, Depends(get_sandbox)]


def get_qruntime(session: SessionDep) -> QuestionRuntimeDB:
    return QuestionRuntimeDB(session)


QuestionRuntimeDBDependency = Annotated[QuestionRuntimeDB, Depends(get_qruntime)]


def get_question_runtime_service(
    qm: QuestionManagerDependency,
    runtime_db: QuestionRuntimeDBDependency,
    sandbox: SandboxDependency,
) -> QuestionRunTimeService:
    return QuestionRunTimeService(qm, runtime_db, sandbox)


QuestionRuntimeServiceDependency = Annotated[
    QuestionRunTimeService, Depends(get_question_runtime_service)
]


def get_runtime_sync(
    runtime_db: QuestionRuntimeDBDependency,
) -> QuestionRunTimeSyncService:
    return QuestionRunTimeSyncService(runtime_db)


QuestionRuntimeSyncDependency = Annotated[
    QuestionRunTimeSyncService,
    Depends(get_runtime_sync),
]

__all__ = [
    "QuestionRuntimeDBDependency",
    "QuestionRuntimeServiceDependency",
    "QuestionRuntimeSyncDependency",
    "SandboxDependency",
    "get_qruntime",
    "get_question_runtime_service",
    "get_runtime_sync",
    "get_sandbox",
]

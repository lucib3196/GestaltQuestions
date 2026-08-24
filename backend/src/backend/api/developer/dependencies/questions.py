from typing import Annotated

from fastapi import Depends

from backend.api.dependencies import QuestionManagerDependency
from backend.api.dependencies.core import SessionDep
from backend.developer import DeveloperQuestionService
from backend.developer.export.service import DeveloperDownloadService
from backend.developer.questions.access import QuestionAccessService
from backend.developer.questions.authorizer import DeveloperQuestionAuthorizer
from backend.question.access import QuestionAccessAdapter
from backend.question.export import QuestionDownload
from backend.question.reader import QuestionReader

from .collections import QuestionCollectionAccessReaderDependency
from .profiles import DeveloperProfileDependency


def get_question_access_adapter(session: SessionDep) -> QuestionAccessAdapter:
    return QuestionAccessAdapter(session)


QuestionAccessAdapterDependency = Annotated[
    QuestionAccessAdapter,
    Depends(get_question_access_adapter),
]


def get_question_access(
    adapter: QuestionAccessAdapterDependency,
    profile: DeveloperProfileDependency,
    access_reader: QuestionCollectionAccessReaderDependency,
) -> QuestionAccessService:
    return QuestionAccessService(
        adapter,
        profile,
        access_reader=access_reader,
    )


QuestionAccessDependency = Annotated[
    QuestionAccessService,
    Depends(get_question_access),
]


def get_developer_question_authorizer(
    question_access: QuestionAccessDependency,
    profile: DeveloperProfileDependency,
) -> DeveloperQuestionAuthorizer:
    return DeveloperQuestionAuthorizer(
        question_access=question_access,
        profile=profile,
    )


QuestionAuthorizer = Annotated[
    DeveloperQuestionAuthorizer,
    Depends(get_developer_question_authorizer),
]


def get_dev_question_manager(
    session: SessionDep,
    qm: QuestionManagerDependency,
    profile: DeveloperProfileDependency,
    authorizer: QuestionAuthorizer,
) -> DeveloperQuestionService:
    return DeveloperQuestionService(
        session,
        qm,
        profile,
        authorizer,
    )


DevQManager = Annotated[
    DeveloperQuestionService,
    Depends(get_dev_question_manager),
]


def get_dev_exporter(
    session: SessionDep,
    question_manager: QuestionManagerDependency,
    authorizer: QuestionAuthorizer,
) -> DeveloperDownloadService:
    downloader = QuestionDownload(
        reader=QuestionReader(session),
        question_manager=question_manager,
    )
    return DeveloperDownloadService(
        authorizer=authorizer,
        downloader=downloader,
    )


ExporterDep = Annotated[
    DeveloperDownloadService,
    Depends(get_dev_exporter),
]

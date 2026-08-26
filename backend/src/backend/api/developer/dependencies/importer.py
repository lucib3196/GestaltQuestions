from typing import Annotated

from fastapi import Depends

from backend.api.dependencies import SessionDep
from backend.developer.importer import DeveloperImportService

from .questions import DevQManager


def get_importer(session: SessionDep, qservice: DevQManager) -> DeveloperImportService:
    return DeveloperImportService(session, qservice)


DevImporterDep = Annotated[DeveloperImportService, Depends(get_importer)]

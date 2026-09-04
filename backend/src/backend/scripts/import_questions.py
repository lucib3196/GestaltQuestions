import argparse
import asyncio
from pathlib import Path
from uuid import UUID

from gdrive_importer.gdrive_indexer import GoogleDriveIndexer
from sqlmodel import Session

from backend.accounts.users import UserManager
from backend.api.dependencies.storage import get_storage_manager
from backend.core.firebase import initialize_firebase_app
from backend.database.config import engine
from backend.developer import DeveloperProfileService, DeveloperQuestionService
from backend.developer.collections.access import QuestionCollectionAccessReader
from backend.developer.importer import DeveloperImportService
from backend.developer.questions.access import QuestionAccessService
from backend.developer.questions.authorizer import DeveloperQuestionAuthorizer
from backend.question import Status
from backend.question.access import QuestionAccessAdapter
from backend.question.importer import (
    DriveQuestionImporter,
    DriveQuestionPackageDiscoverer,
)
from backend.question.importer.local_discoverer import LocalDiscoverer
from backend.question.importer.local_importer import LocalQuestionImporter
from backend.question.manager import QuestionManager
from backend.question.services.question import QuestionDB
from backend.question.storage import QuestionStorage


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import question packages.")
    parser.add_argument("user_id", type=UUID)
    parser.add_argument("source_type", choices=("local", "drive"))
    parser.add_argument("--manifest", type=Path)
    parser.add_argument("--credentials", default="../credentials.json", type=Path)
    parser.add_argument("--token", default="../token.json", type=Path)

    args = parser.parse_args()
    if args.manifest is None:
        args.manifest = Path(
            "local_question_manifest.json"
            if args.source_type == "local"
            else "drive_question_manifest.json"
        )

    return args


def build_import_tools(args: argparse.Namespace):
    if args.source_type == "local":
        return LocalDiscoverer(), LocalQuestionImporter()

    indexer = GoogleDriveIndexer.from_credentials(args.credentials, args.token)
    return DriveQuestionPackageDiscoverer(indexer), DriveQuestionImporter(indexer)


async def main() -> None:
    args = parse_args()
    initialize_firebase_app()
    storage = get_storage_manager()
    discoverer, importer = build_import_tools(args)
    packages = discoverer.load_packages(args.manifest)

    with Session(engine, expire_on_commit=False) as session:
        profile_service = DeveloperProfileService(
            session=session,
            storage=storage,
            user_manager=UserManager(session),
        )
        question_manager = QuestionManager(
            storage=QuestionStorage.from_session(storage, session),
            qdb=QuestionDB(session),
        )
        question_access = QuestionAccessService(
            adapter=QuestionAccessAdapter(session),
            profile_service=profile_service,
            access_reader=QuestionCollectionAccessReader(session),
        )
        developer_questions = DeveloperQuestionService(
            session=session,
            question_manager=question_manager,
            developer_profiles=profile_service,
            authorizer=DeveloperQuestionAuthorizer(
                question_access=question_access,
                profile=profile_service,
            ),
        )
        qimporter = DeveloperImportService(
            session=session, developer_questions=developer_questions
        )

        for package in packages.values():
            try:
                question = await qimporter.import_question(
                    user_id=args.user_id,
                    importer=importer,
                    source=package,
                    status=Status.PUBLISHED,
                )
                print(f"Imported {question.id}: {question.title}")
            except Exception as e:
                print(f"Failed to import {package}")
                raise e


if __name__ == "__main__":
    asyncio.run(main())

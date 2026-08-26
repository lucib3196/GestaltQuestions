import argparse
import asyncio
from pathlib import Path
from uuid import UUID
from backend.core.firebase import initialize_firebase_app
from gdrive_importer.gdrive_indexer import GoogleDriveIndexer
from sqlmodel import Session

from backend.accounts.users import UserManager
from backend.api.dependencies.storage import get_storage_manager
from backend.database.config import engine
from backend.developer import DeveloperProfileService, DeveloperQuestionService
from backend.developer.questions.access import QuestionAccessService
from backend.developer.questions.authorizer import DeveloperQuestionAuthorizer
from backend.question.access import QuestionAccessAdapter
from backend.developer.collections.access import QuestionCollectionAccessReader
from backend.question.importer import (
    DriveQuestionImporter,
    DriveQuestionPackageDiscoverer,
)
from backend.question.manager import QuestionManager
from backend.question.services.question import QuestionDB


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import Drive question packages.")
    parser.add_argument("--user-id", required=True, type=UUID)
    parser.add_argument("--manifest", default="drive_question_manifest.json", type=Path)
    parser.add_argument("--credentials", default="../credentials.json", type=Path)
    parser.add_argument("--token", default="../token.json", type=Path)
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    initialize_firebase_app()
    storage = get_storage_manager()
    indexer = GoogleDriveIndexer.from_credentials(args.credentials, args.token)
    discoverer = DriveQuestionPackageDiscoverer(indexer)
    importer = DriveQuestionImporter(indexer)
    packages = discoverer.load_packages(args.manifest)

    with Session(engine, expire_on_commit=False) as session:
        profile_service = DeveloperProfileService(
            session=session,
            storage=storage,
            user_manager=UserManager(session),
        )
        question_manager = QuestionManager(
            storage=storage,
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

        for package in packages.values():
            question = await developer_questions.import_question(
                user_id=args.user_id,
                importer=importer,
                source=package,
            )
            print(f"Imported {question.id}: {question.title}")


if __name__ == "__main__":
    asyncio.run(main())

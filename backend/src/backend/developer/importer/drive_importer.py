import json
from dataclasses import dataclass
from pathlib import Path

from gdrive_importer.auth import DriveService
from gdrive_importer.gdrive_indexer import GoogleDriveIndexer
from gdrive_importer.models import GDriveFile

CLIENT_FILES_FOLDER = "clientFilesQuestion"


@dataclass
class DriveQuestionPackage:
    parent_id: str
    files: dict[str, GDriveFile]


class DriveQuestionPackageDiscoverer:
    def __init__(
        self,
        indexer: GoogleDriveIndexer,
        *,
        client_files_folder: str = CLIENT_FILES_FOLDER,
    ) -> None:
        self.indexer = indexer
        self.client_files_folder = client_files_folder

    @classmethod
    def from_credentials(
        cls,
        credentials_path: str | Path,
        token_path: str | Path | None = None,
        *,
        client_files_folder: str = CLIENT_FILES_FOLDER,
    ) -> "DriveQuestionPackageDiscoverer":
        service = DriveService(credentials_path, token_path)
        indexer = GoogleDriveIndexer(service)
        return cls(indexer, client_files_folder=client_files_folder)

    def discover_packages(
        self,
        *,
        root_folder_name: str,
        target_folder_name: str,
    ) -> dict[str, DriveQuestionPackage]:
        root_folder = self._get_unique_folder(
            self.indexer.find_folder(root_folder_name),
            root_folder_name,
        )
        target_folder = self._get_unique_folder(
            self.indexer.find_folder(
                name=target_folder_name,
                parent_id=root_folder.id,
            ),
            target_folder_name,
        )
        children = self.indexer.list_children(
            folder_id=target_folder.id,
            recursive=True,
        )

        return self._build_packages(children, root_folder_id=target_folder.id)

    def save_packages(
        self,
        packages: dict[str, DriveQuestionPackage],
        path: str | Path,
    ) -> None:
        path = Path(path)
        payload = {
            "questions": [
                {
                    "parent_id": package.parent_id,
                    "files": {
                        filename: file.model_dump()
                        for filename, file in package.files.items()
                    },
                }
                for package in packages.values()
            ]
        }

        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2))

    def load_packages(self, path: str | Path) -> dict[str, DriveQuestionPackage]:
        payload = json.loads(Path(path).read_text())

        packages: dict[str, DriveQuestionPackage] = {}

        for item in payload["questions"]:
            package = DriveQuestionPackage(
                parent_id=item["parent_id"],
                files={
                    filename: GDriveFile.model_validate(file_data)
                    for filename, file_data in item["files"].items()
                },
            )
            packages[package.parent_id] = package

        return packages

    def pretty_print(self, packages: dict[str, DriveQuestionPackage]) -> None:
        print(f"Number of questions: {len(packages)}")
        for parent_id, package in packages.items():
            print(f"Parent ID: {parent_id[:5]}, num files: {len(package.files)}\n")
            for filename in package.files:
                print(f"\t->{filename}")

    def _build_packages(
        self,
        children: list[GDriveFile],
        *,
        root_folder_id: str,
    ) -> dict[str, DriveQuestionPackage]:
        client_folder_to_question: dict[str, str] = {}
        question_packages: dict[str, DriveQuestionPackage] = {}

        for child in children:
            if not child.parents:
                continue

            parent_id = child.parents[0]

            if parent_id == root_folder_id:
                continue

            if child.mimeType == GoogleDriveIndexer._FOLDERMIME:
                if child.name == self.client_files_folder:
                    client_folder_to_question[child.id] = parent_id
                continue

            question_parent_id = client_folder_to_question.get(parent_id)

            if question_parent_id is not None:
                question_packages.setdefault(
                    question_parent_id,
                    DriveQuestionPackage(parent_id=question_parent_id, files={}),
                ).files[f"{self.client_files_folder}/{child.name}"] = child
                continue

            question_packages.setdefault(
                parent_id,
                DriveQuestionPackage(parent_id=parent_id, files={}),
            ).files[child.name] = child

        return question_packages

    @staticmethod
    def _get_unique_folder(folders: list[GDriveFile], name: str) -> GDriveFile:
        if not folders:
            raise ValueError(f"Folder not found: {name}")
        if len(folders) > 1:
            raise ValueError(f"Expected one folder named {name!r}, got {len(folders)}")
        return folders[0]


if __name__ == "__main__":
    cred_path = Path("../credentials.json").resolve()
    discoverer = DriveQuestionPackageDiscoverer.from_credentials(cred_path)
    question_packages = discoverer.discover_packages(
        root_folder_name="Learning Lab AI Project",
        target_folder_name="statics",
    )
    discoverer.save_packages(question_packages, Path("drive_question_manifest.json"))
    discoverer.pretty_print(question_packages)

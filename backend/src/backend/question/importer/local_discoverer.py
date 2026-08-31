import json
from dataclasses import asdict, dataclass
from pathlib import Path

from .discover import QuestionPackageDiscoverer

CLIENT_FILES_FOLDER = "clientFilesQuestion"
METADATA_FILENAME = "info.json"
DEFAULT_IGNORED_EXTENSIONS = frozenset({".pyc", ".pyo"})
DEFAULT_IGNORED_DIRECTORY_NAMES = frozenset({"__pycache__"})


@dataclass
class LocalQuestionPackage:
    """Files discovered for one local question directory."""

    package_id: str
    title: str
    directory: Path
    file_paths: list[Path]
    metadata_path: Path


@dataclass
class LocalDiscoverySpec:
    """Inputs needed to discover local question packages."""

    root: str | Path


@dataclass
class LocalDiscoveryStats:
    """Debug counts from the most recent local discovery run."""

    total_questions: int = 0
    skipped_questions: int = 0
    questions_with_client_files: int = 0


class LocalDiscoverer(
    QuestionPackageDiscoverer[LocalQuestionPackage, LocalDiscoverySpec]
):
    def __init__(
        self,
        *,
        client_files_folder: str = CLIENT_FILES_FOLDER,
        ignored_extensions: set[str] | frozenset[str] = DEFAULT_IGNORED_EXTENSIONS,
        ignored_directory_names: set[str] | frozenset[str] = (
            DEFAULT_IGNORED_DIRECTORY_NAMES
        ),
    ) -> None:
        self.client_files_folder = client_files_folder
        self.ignored_extensions = ignored_extensions
        self.ignored_directory_names = ignored_directory_names
        self.last_stats = LocalDiscoveryStats()

    def discover_packages(
        self,
        spec: LocalDiscoverySpec,
    ) -> dict[str, LocalQuestionPackage]:
        root_path = Path(spec.root)
        if not root_path.exists():
            raise ValueError(f"Root path {root_path} does not exist")
        if not root_path.is_dir():
            raise ValueError(f"Root path {root_path} is not a directory")

        packages: dict[str, LocalQuestionPackage] = {}
        stats = LocalDiscoveryStats()

        for candidate_directory in root_path.rglob("*"):
            if not candidate_directory.is_dir():
                continue
            if self._should_ignore_path(candidate_directory):
                continue

            metadata_path = candidate_directory / METADATA_FILENAME
            if not metadata_path.exists():
                continue

            # A directory with only info.json does not contain enough files to import.
            direct_children = list(candidate_directory.iterdir())
            if len(direct_children) <= 1:
                print(
                    f"Skipping question {candidate_directory.name}: "
                    "only metadata file is present"
                )
                stats.skipped_questions += 1
                continue

            # Package ids are stable relative names that are safe to use as dict keys.
            package_id = (
                candidate_directory.relative_to(root_path).as_posix().replace("/", "_")
            )
            candidate_directory.relative_to(root_path).as_posix()

            # Capture all direct files in the question folder.
            file_paths = [
                path
                for path in direct_children
                if path.is_file() and not self._should_ignore_path(path)
            ]

            # Capture any extra files under clientFilesQuestion, preserving nested files.
            client_files_directory = candidate_directory / self.client_files_folder
            if client_files_directory.exists():
                stats.questions_with_client_files += 1
                client_file_paths = [
                    path
                    for path in client_files_directory.rglob("*")
                    if path.is_file() and not self._should_ignore_path(path)
                ]
                len(client_file_paths)
                file_paths.extend(client_file_paths)
            else:
                client_files_directory = None

            packages[package_id] = LocalQuestionPackage(
                package_id=package_id,
                title=candidate_directory.name,
                directory=candidate_directory,
                file_paths=file_paths,
                metadata_path=metadata_path,
            )
            stats.total_questions += 1

        self.last_stats = stats
        return packages

    def save_packages(
        self,
        packages: dict[str, LocalQuestionPackage],
        path: str | Path,
    ) -> None:
        manifest_path = Path(path)
        payload = {
            "questions": [
                {
                    "package_id": package.package_id,
                    "title": package.title,
                    "directory": str(package.directory),
                    "file_paths": [str(file_path) for file_path in package.file_paths],
                    "metadata_path": str(package.metadata_path),
                }
                for package in packages.values()
            ],
            "stats": asdict(self.last_stats),
        }

        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(payload, indent=2))

    def load_packages(self, path: str | Path) -> dict[str, LocalQuestionPackage]:
        payload = json.loads(Path(path).read_text())

        stats_data = payload.get("stats")
        if stats_data is not None:
            self.last_stats = LocalDiscoveryStats(**stats_data)

        packages: dict[str, LocalQuestionPackage] = {}
        for item in payload["questions"]:
            package = LocalQuestionPackage(
                package_id=item["package_id"],
                title=item["title"],
                directory=Path(item["directory"]),
                file_paths=[Path(file_path) for file_path in item["file_paths"]],
                metadata_path=Path(item["metadata_path"]),
            )
            packages[package.package_id] = package

        return packages

    def pretty_print(self, packages: dict[str, LocalQuestionPackage]) -> None:
        print(f"Number of questions: {len(packages)}")
        print(
            "Stats: "
            f"total={self.last_stats.total_questions}, "
            f"skipped={self.last_stats.skipped_questions}, "
            f"with client files={self.last_stats.questions_with_client_files}"
        )

        for package_id, package in packages.items():
            print(f"Package: {package_id}, ")
            for file_path in package.file_paths:
                print(f"\t->{file_path.name}")

    def _should_ignore_path(self, path: Path) -> bool:
        """Return whether a path should be excluded from local discovery."""
        if any(part in self.ignored_directory_names for part in path.parts):
            return True
        return path.suffix in self.ignored_extensions


if __name__ == "__main__":
    root = Path(r"../helpers/helpers/questions").resolve()
    manifest = Path("local_question_manifest.json")

    discoverer = LocalDiscoverer()
    packages = discoverer.discover_packages(spec=LocalDiscoverySpec(root=root))
    discoverer.pretty_print(packages)
    discoverer.save_packages(packages, manifest)

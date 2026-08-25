import io
from pathlib import Path
from typing import List, TypeVar, Any

from googleapiclient.http import MediaIoBaseDownload
from .auth import DriveService
from .models import GDriveFile

FileT = TypeVar("FileT", bound=GDriveFile)


class GoogleDriveIndexer[FileT: GDriveFile]:
    _SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
    _FOLDERMIME = "application/vnd.google-apps.folder"

    def __init__(
        self,
        service: DriveService,
        file_model: type[FileT] = GDriveFile,
    ):
        """Initialize the indexer with OAuth credentials and an optional token cache."""
        self.file_model = file_model
        self._service = service.get_service()

    def get_file(self, name: str, *, trashed: bool = False) -> List[GDriveFile]:
        """Return non-trashed Drive files matching the given name."""
        query = self._query(
            self._name_is(name),
            self._trashed_is(trashed),
        )
        return self._query_files(query)

    def get_folder(self, name: str, *, trashed: bool = False) -> List[GDriveFile]:
        query = self._query(
            self._name_is(name),
            self._is_folder(),
            self._trashed_is(trashed),
        )
        return self._query_files(query)

    def find_folder(
        self,
        name: str,
        *,
        parent_id: str | None = None,
        trashed: bool = False,
    ) -> List[GDriveFile]:
        query_parts = [
            self._name_is(name),
            self._is_folder(),
            self._trashed_is(trashed),
        ]

        if parent_id is not None:
            query_parts.append(self._in_parent(parent_id))

        return self._query_files(self._query(*query_parts))

    def list_children(
        self,
        *,
        folder_name: str | None = None,
        folder_id: str | None = None,
        recursive: bool = False,
    )->List[GDriveFile]:
        if (folder_name is None) == (folder_id is None):
            raise ValueError("Expected exactly one of folder_name or folder_id")

        if folder_name is not None:
            folders = self.find_folder(folder_name)

            if not folders:
                raise ValueError(f"Folder not found: {folder_name}")

            if len(folders) > 1:
                raise ValueError(
                    f"Cannot determine folder: multiple folders named {folder_name!r}"
                )

            folder_id = folders[0].id
        if not folder_id:
            raise ValueError("Folder ID cannot be none")

        query = self._query(
            self._in_parent(folder_id),
            self._trashed_is(False),
        )
        files = self._query_files(query)
        if not recursive:
            return files
        results = []
        for f in files:
            results.append(f)
            if f.mimeType == self._FOLDERMIME:
                results.extend(self.list_children(folder_id=f.id, recursive=True))
        return results

    def read_file(self, id: str) -> bytes:
        request = self._service.files().get_media(fileId=id)
        file = io.BytesIO()
        downloader = MediaIoBaseDownload(file, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        return file.getvalue()

    def _query_files(self, query: str) -> List[GDriveFile]:
        response = (
            self._service.files()
            .list(
                q=query,
                fields=self._construct_fields(),
                pageSize=1000,
            )
            .execute()
        )
        files = response.get("files", [])
        return self._model_validate(files)

    @staticmethod
    def _query(*parts: str) -> str:
        return " and ".join(parts)

    @staticmethod
    def _name_is(name: str) -> str:
        return f"name = '{name}'"

    def _is_folder(
        self,
    ) -> str:
        return f"mimeType = '{self._FOLDERMIME}'"

    @staticmethod
    def _mime_type_is(mime_type: str) -> str:
        return f"mimeType = '{mime_type}'"

    @staticmethod
    def _in_parent(folder_id: str) -> str:
        return f"'{folder_id}' in parents"

    @staticmethod
    def _trashed_is(trashed: bool) -> str:
        return f"trashed = {str(trashed).lower()}"

    def _construct_fields(self) -> str:
        """Build the Drive API fields selector from the configured file model."""
        fields = ",".join(self.file_model.model_fields.keys())
        return f"files({fields})"

    def _model_validate(self, data: List[Any]) -> List[GDriveFile]:
        return [self.file_model.model_validate(f) for f in data]


# if __name__ == "__main__":
    

    # root = Path(__file__).parents[2]
    # cred_path = root / "credentials.json"
    # token_path = root / "token.json"
    # drive = DriveService(cred_path, token_path)
    # indexer = GoogleDriveIndexer(drive)
    # # BASE ID points to the statics folder
    # statics_folder = "1XJp7G0n7SQFtV8CDggO82V4V_09LpIiC"
    # name = "Learning Lab AI Project"
    # parent = indexer.find_folder(name)
    # statics = indexer.find_folder(name="statics", parent_id=parent[0].id)
    # children =indexer.list_children(folder_id=statics[0].id, recursive=True)
    # print(children[0])
    # (root / "data.json").write_text(json.dumps(to_serializable(results)))

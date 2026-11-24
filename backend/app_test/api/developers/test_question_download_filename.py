from io import BytesIO
from zipfile import ZipFile

import pytest
from fastapi.testclient import TestClient

from app_test.factories.question_factory import MakeQuestion
from app_test.support.developer import DeveloperActor
from backend.api.dependencies.users import get_current_user_id
from backend.storage import Storage
from backend.utils import safe_dir_name


@pytest.mark.parametrize(
    ("title", "expected_stem"),
    [
        ("Beam Bending - Part 2", "beamBendingPart2"),
        ("StressTensor", "stressTensor"),
        ("Équilibre des forces", "equilibreDesForces"),
        ("案例", None),
    ],
)
def test_question_download_uses_camel_case_zip_filename(
    api_client: TestClient,
    dev_owner: DeveloperActor,
    make_question: MakeQuestion,
    raw_storage: Storage,
    storage_base_path: str,
    title: str,
    expected_stem: str | None,
) -> None:
    raw_storage.write(f"{storage_base_path}/question.html", b"<p>Question</p>")
    question = make_question(
        dev_owner.profile,
        title=title,
        storage_path=storage_base_path,
        storage_type=raw_storage.get_storage_type(),
    )
    api_client.app.dependency_overrides[get_current_user_id] = lambda: str(
        dev_owner.user.id
    )

    response = api_client.post(f"/developer/questions/{question.id}/download")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    stem = expected_stem or f"untitledQuestion{question.id.hex[:5]}"
    assert (
        response.headers["content-disposition"] == f'attachment; filename="{stem}.zip"'
    )
    with ZipFile(BytesIO(response.content)) as archive:
        assert (
            archive.read(f"{safe_dir_name(title)}/question.html") == b"<p>Question</p>"
        )

import json
from src.model.question import Question
import pytest
from src.core import logger
from src.utils import safe_dir_name
from pathlib import Path
from app_test.shared.mock_data import QUESTIONS
from copy import deepcopy
from src.utils import safe_dir_name


def prepare_question_data(question_manager, qdata, tmp_path):
    d = deepcopy(qdata)
    storage_type = question_manager.STORAGE_TYPE
    if storage_type == "local":
        d["base_path"] = Path(tmp_path / d.get("base_path", "")).as_posix()
    elif storage_type == "cloud":
        d["base_path"] = f"cloud/{d.get('base_path')}"
    return d


# Test question creation
@pytest.mark.asyncio
@pytest.mark.parametrize("qdata", QUESTIONS)
async def test_create_question_no_files(question_manager, qdata, tmp_path):
    # Arrange
    d = prepare_question_data(question_manager, qdata, tmp_path)
    storage_type = question_manager.storage_manager.get_storage_type()

    # Act
    qcreated = await question_manager.create_question(d)

    # Assert basic invariants
    assert qcreated is not None
    assert isinstance(qcreated, Question)

    base_path = d.get("base_path", "").rstrip("/")
    dir_name = safe_dir_name(f"{qcreated.title}_{str(qcreated.id)[:8]}")
    expected_path = f"{base_path}/{dir_name}"

    if storage_type == "cloud":
        expected_storage_path = f"{expected_path}/"
        actual_path = qcreated.blob_path
    else:
        expected_storage_path = expected_path
        actual_path = qcreated.local_path

    # Assert stored path correctness
    assert actual_path == expected_storage_path

    # Assert storage was actually created
    assert question_manager.storage_manager.exists(expected_storage_path)


@pytest.mark.asyncio
@pytest.mark.asyncio
async def test_create_question_with_files(
    question_manager,
    question_payload,
    question_file_payload,
):
    qcreated = await question_manager.create_question(
        question_payload,
        files=question_file_payload,
    )
    assert qcreated










# Question file test
@pytest.mark.asyncio
@pytest.mark.parametrize("payload", QUESTIONS)
async def test_get_question_file_names(
    question_manager, payload, question_file_payload
):
    qcreated = await question_manager.create_question(
        payload,
        files=question_file_payload,
    )
    filenames = await question_manager.get_question_file_names(qcreated.id)
    assert len(filenames) > 0
    # Assert that the names of the files are all the same
    assert set([f.filename for f in question_file_payload]) == set(filenames)
    logger.info(f"filenames {filenames}")


@pytest.mark.asyncio
@pytest.mark.parametrize("payload", QUESTIONS)
async def test_get_question_filepaths(
    question_manager,
    payload,
    question_file_payload,
):
    qcreated = await question_manager.create_question(
        payload,
        files=question_file_payload,
    )
    logger.info("This is the created question %s", qcreated)
    filepaths = await question_manager.get_question_file_names(qcreated.id)
    logger.info(f"The retrieved filepaths {filepaths}")
    assert filepaths
    assert len(filepaths) == len(question_file_payload)
    assert set([f.filename for f in question_file_payload]) == set(
        [Path(f).name for f in filepaths]
    )


@pytest.mark.asyncio
@pytest.mark.parametrize("payload", QUESTIONS)
async def test_get_question_file(
    question_manager,
    payload,
    question_file_payload,
):
    qcreated = await question_manager.create_question(
        payload,
        files=question_file_payload,
    )
    for f in question_file_payload:
        retrieved = await question_manager.get_question_file(
            qcreated.id,
            f.filename,
        )
        assert retrieved


# Test for reading and writting
@pytest.mark.asyncio
@pytest.mark.parametrize("payload", QUESTIONS)
async def test_read_file(
    question_manager,
    payload,
    question_file_payload,
):
    qcreated = await question_manager.create_question(
        payload,
        files=question_file_payload,
    )

    for f in question_file_payload:
        content = await question_manager.read_file(qcreated.id, f.filename)

        if f.filename.endswith(".json"):
            assert json.loads(content) == f.content
        else:
            assert f.content == content


@pytest.mark.asyncio
@pytest.mark.parametrize("payload", QUESTIONS)
async def test_update_file(
    question_manager,
    payload,
    question_file_payload,
):
    qcreated = await question_manager.create_question(
        payload,
        files=question_file_payload,
    )
    logger.info("This is the file payload", question_file_payload)
    for f in question_file_payload:
        new_content = f"New Content {f.filename}"
        await question_manager.update_file(
            qcreated.id, filename=f.filename, content=new_content
        )
        content = await question_manager.read_file(qcreated.id, f.filename)
        assert content == new_content


@pytest.mark.asyncio
@pytest.mark.parametrize("payload", QUESTIONS)
async def test_delete_file(
    question_manager,
    payload,
    question_file_payload,
):
    qcreated = await question_manager.create_question(
        payload,
        files=question_file_payload,
    )

    for f in question_file_payload:
        await question_manager.delete_file(qcreated.id, f.filename)
        data = await question_manager.read_file(qcreated.id, f.filename)
        assert data is None


@pytest.mark.asyncio
async def test_handle_question_files(
    question_manager,
    question_file_payload,
):
    storage_path = "qs_test"

    data = await question_manager.handle_question_files(
        question_file_payload,
        storage_path,
        True,
    )

    assert data["client_files"] == []
    assert len(data["other_files"]) == len(question_file_payload)

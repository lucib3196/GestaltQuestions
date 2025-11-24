import pytest


@pytest.mark.asyncio
async def test_create_question(question_resource, question_payload_full_dict):
    qcreated = await question_resource.create_question(question_payload_full_dict)
    assert qcreated


@pytest.mark.asyncio
async def test_create_question_with_files(
    question_resource, question_payload_full_dict, question_file_payload
):
    qcreated = await question_resource.create_question(
        question_payload_full_dict, files=question_file_payload
    )
    assert qcreated


@pytest.mark.asyncio
async def test_handle_question_files(
    question_resource, question_file_payload, tmp_path
):
    storage_path = "qs_test"
    data = await question_resource.handle_question_files(
        question_file_payload, storage_path, True
    )
    # No Images passed in
    assert data["client_files"] == []
    assert len(data["other_files"]) == len(question_file_payload)

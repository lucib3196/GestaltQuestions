import pytest
import json

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
async def test_handle_question_files(question_resource, question_file_payload):
    storage_path = "qs_test"
    data = await question_resource.handle_question_files(
        question_file_payload, storage_path, True
    )
    # No Images passed inn
    assert data["client_files"] == []
    assert len(data["other_files"]) == len(question_file_payload)


@pytest.mark.asyncio
async def test_get_question_files(
    question_resource, question_payload_full_dict, question_file_payload
):
    qcreated = await question_resource.create_question(
        question_payload_full_dict, files=question_file_payload
    )

    response = await question_resource.get_question_file_names(qcreated.id)
    assert response
    assert len(response.filenames) == len(question_file_payload)


@pytest.mark.asyncio
async def test_get_question_file(
    question_resource, question_payload_full_dict, question_file_payload
):
    qcreated = await question_resource.create_question(
        question_payload_full_dict, files=question_file_payload
    )
    for f in question_file_payload:
        retrieved = await question_resource.get_question_file(qcreated.id, f.filename)
        assert retrieved



@pytest.mark.asyncio
async def test_delete_file(
    question_resource, question_payload_full_dict, question_file_payload
):
    qcreated = await question_resource.create_question(
        question_payload_full_dict, files=question_file_payload
    )
    for f in question_file_payload:
        await question_resource.delete_file(qcreated.id, f.filename)
        data = await question_resource.read_file(qcreated.id,f.filename)
        assert data.data is None


@pytest.mark.asyncio
async def test_read_file(question_resource, question_payload_full_dict, question_file_payload):
    qcreated = await question_resource.create_question(
        question_payload_full_dict, files=question_file_payload
    )

    for f in question_file_payload:
        data = await question_resource.read_file(qcreated.id, f.filename)
        returned = data.data
        # If it is a JSON file, parse response before comparing
        if f.filename.endswith(".json"):
            assert json.loads(returned) == f.content
        else:
            # All other file types compared as strings
            assert returned == f.content
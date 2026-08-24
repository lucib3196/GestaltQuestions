import pytest
from backend.question.export.service import QuestionDownload
from app_test.factories.question_factory import MakeQuestionPayload
from backend.question.manager import QuestionManager
from backend.question.reader.question_reader import QuestionReader

@pytest.fixture
def downloader(question_manager):
    return QuestionDownload(question_manager)

@pytest.fixture
def reader(db_session)->QuestionReader:
    return QuestionReader(db_session)

@pytest.mark.asyncio
async def test_download(
    question_manager: QuestionManager,
    make_question_payload: MakeQuestionPayload,
    downloader: QuestionDownload, 
    storage_base_path: str,
    reader: QuestionReader
):
    payload = make_question_payload()
    question = await question_manager.create_question(
        payload.question, storage_base_path, payload.files
    )
    files = await question_manager.get_question_filedata(question.id)
    # print(files, "Question files")
    # downloaded = await downloader.download(question)
    # print(downloaded)
    # meta = await downloader.get_question_meta(question)
    data = reader.get_question_read_model(question)
    print(data)

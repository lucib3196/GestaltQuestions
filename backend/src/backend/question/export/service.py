from backend.question.manager import QuestionManager
from backend.storage import FileData
import base64
import json
from backend.question.models import Question
from backend.shared import ID
from typing import Dict
class QuestionDownload:

    def __init__(self, question_manager: QuestionManager):
        self._manager = question_manager
        
        
    async def download(self, question: Question|ID)->Dict[str, bytes|bytearray]:
        question_id = self._resolve_question_id(question)
        files = await self._manager.get_question_filedata(question_id)
        qmeta = await self._manager.get_question(question_id)
        payload: Dict[str, bytes|bytearray] = {}
        for f in files:
            content = self.normalize_content(f)
            if content:
                payload[f.filename] = content
        payload["info2.json"] = qmeta.model_dump_json().encode("utf-8")
        return payload
    

    @staticmethod
    def normalize_content(file: FileData) -> bytes | bytearray|None:
        content = file.content
        if isinstance(content, bytes | bytearray):
            return content
        elif isinstance(content, dict):
            content = json.dumps(content).encode("utf-8")
        elif file.mime_type.startswith("image/") and isinstance(content, str):
            return base64.b64decode(content)
        elif isinstance(content, str):
            return str(content).encode("utf-8")
        else:
            return str(content).encode("utf-8")

    @staticmethod
    def _resolve_question_id(question: Question|ID)->ID:
        if isinstance(question, Question):
                    return question.id
        return question
    
    


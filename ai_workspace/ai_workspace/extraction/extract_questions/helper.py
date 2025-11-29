from ai_workspace.models.models import ExtractedQuestion
import json
from pathlib import Path

data = r"C:\Github\GestatlQuestions\ai_workspace\ai_workspace\extraction\extract_questions\output\extract_question\output.json"

data = json.loads(Path(data).read_text())
data = data["questions"]["questions"][0]
print(data)

data = ExtractedQuestion.model_validate(data)

print(data.as_string())

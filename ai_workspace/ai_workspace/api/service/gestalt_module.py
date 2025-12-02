from ai_workspace.code_generator.graphs import gestalt_generator as gc
from ai_workspace.models.models import Question
from typing import Dict
from langchain_core.runnables.config import RunnableConfig
import httpx

def run_text(question: str, config: RunnableConfig) -> Dict[str, str]:
    question_data = Question(
        question_text=question, solution_guide=None, final_answer=None, question_html=""
    )
    input_state: gc.State = {"question": question_data, "metadata": None, "files": {}}
    result = gc.app.invoke(input_state, config=config)
    files = result["files"]
    return files

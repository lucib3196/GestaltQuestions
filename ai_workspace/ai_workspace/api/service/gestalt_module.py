from typing import Dict, Any, List
from pathlib import Path
from langchain_core.runnables.config import RunnableConfig
from ai_workspace.code_generator.graphs import gestalt_generator as gc
from ai_workspace.code_generator.graphs import multi_modal_gestalt as gcm
from ai_workspace.models.models import Question


async def run_text(question: str, config: RunnableConfig) -> Dict[str, str]:
    question_data = Question(
        question_text=question, solution_guide=None, final_answer=None, question_html=""
    )
    input_state: gc.State = {"question": question_data, "metadata": None, "files": {}}
    result = await gc.app.ainvoke(input_state, config=config)
    files = result["files"]
    return files


async def run_image(image: str | Path, config: RunnableConfig) -> List[Dict[str, Any]]:
    input_state = gcm.State(image=image)
    response = await gcm.graph.ainvoke(input_state)
    data: List[Dict[str, Any]] = response["gestalt_modules"]
    return data

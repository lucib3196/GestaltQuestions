# Standard library
import asyncio
import json
from pathlib import Path
from typing import List

# Third-party
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel

# Local imports
from ai_workspace.extraction.extract_questions.graphs import (
    extract_questions_graph as ex,
)
from ai_workspace.models.models import ExtractedQuestion, Question
from ai_workspace.utils import save_graph_visualization, to_serializable
from . import gestalt_generator as gestalt


class State(BaseModel):
    image: str | Path
    extraction_results: List[ExtractedQuestion] = []
    gestalt_modules: gestalt.State | None = None


async def extract_questions(state: State):
    input_state = ex.State(lecture_pdf=state.image)
    result = await ex.graph.ainvoke(input_state)

    return {"extraction_results": result.get("questions", [])}  # type: ignore


async def generate_modules(state: State):
    extracted_questions = state.extraction_results
    if not extracted_questions:
        return

    # Map the values
    tasks = []
    for q in extracted_questions:
        question = Question(
            question_text=q.question_text,
            solution_guide=q.solution,
            final_answer="",
            question_html="",
        )
        input_state: gestalt.State = {
            "question": question,
            "metadata": None,
            "files": {},
        }
        tasks.append(gestalt.app.ainvoke(input_state))
    results: List[gestalt.State] = await asyncio.gather(*tasks)
    return {"gestalt_modules": results}


builder = StateGraph(State)
builder.add_node("extract_questions", extract_questions)
builder.add_node("generate_modules", generate_modules)

builder.add_edge(START, "extract_questions")

builder.add_edge("extract_questions", "generate_modules")
builder.add_edge("generate_modules", END)

graph = builder.compile()


if __name__ == "__main__":
    # Path to the lecture PDF
    pdf_path = Path(r"ai_workspace\data\images\mass_block.png").resolve()

    output_path = Path(r"ai_workspace/code_generator/outputs").resolve()

    save_path = output_path / "multi_modal_gestalt"
    save_graph_visualization(graph, save_path, "graph.png")

    # Create graph input state
    graph_input = State(image=pdf_path)

    # # Run the async graph and print the response
    try:
        response = asyncio.run(graph.ainvoke(graph_input))
        print("\n--- Graph Response ---")
        print(response)

        data_path = save_path / "output.json"
        data_path.write_text(json.dumps(to_serializable(response)))
    except Exception as e:
        print("\n❌ Error while running graph:")
        print(e)

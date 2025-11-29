import asyncio
from pathlib import Path
from typing import List

from pydantic import BaseModel, Field

from langchain.chat_models import init_chat_model
from langsmith import Client
from langgraph.graph import StateGraph, START, END

from ai_workspace.models.models import ExtractedQuestion
from ai_workspace.ai_base.multimodel_io import PDFMultiModal
from ai_workspace.ai_base.settings import get_settings
from ai_workspace.utils.utils import extract_langsmith_prompt
from ai_workspace.utils import save_graph_visualization

# --- Initialization ---

# Initialize LangSmith client and project settings
client = Client()
settings = get_settings()

# Load and extract the LangSmith prompt
prompt = extract_langsmith_prompt(client.pull_prompt("extract-all-questions"))

# Retrieve long-context model configuration
lcm = settings.long_context_model
if lcm is None:
    raise ValueError(
        "Long-context model (settings.long_context_model) is not configured."
    )

# Validate model parameters
model = lcm.model
provider = lcm.provider

if not model:
    raise ValueError("Invalid configuration: 'model' is missing or empty.")
if not provider:
    raise ValueError("Invalid configuration: 'provider' is missing or empty.")

# Initialize chat model
llm = init_chat_model(model=model, model_provider=provider)


class State(BaseModel):
    lecture_pdf: str | Path
    questions: List[ExtractedQuestion] = []


async def extract_questions(state: State):
    processor = PDFMultiModal()

    class Response(BaseModel):
        questions: List[ExtractedQuestion]

    response = await processor.ainvoke(
        prompt=prompt,
        pdf_path=state.lecture_pdf,
        output_model=Response,
        llm=llm,
    )
    return {"questions": response}


builder = StateGraph(State)
builder.add_node("extract_questions", extract_questions)

builder.add_edge(START, "extract_questions")

builder.add_edge("extract_questions", END)

graph = builder.compile()


if __name__ == "__main__":
    # Path to the lecture PDF
    pdf_path = Path(r"ai_workspace\data\images\mass_block.png").resolve()

    output_path = Path(r"ai_workspace\extraction\extract_questions\output").resolve()

    save_path = output_path / "extract_question"
    save_graph_visualization(graph, save_path, "graph.png")

    # Create graph input state
    graph_input = State(lecture_pdf=pdf_path)

    # Run the async graph and print the response
    try:
        response = asyncio.run(graph.ainvoke(graph_input))
        print("\n--- Graph Response ---")
        print(response)
        import json
        from ai_workspace.utils import to_serializable

        data_path = save_path / "output.json"
        data_path.write_text(json.dumps(to_serializable(response)))
    except Exception as e:
        print("\n❌ Error while running graph:")
        print(e)

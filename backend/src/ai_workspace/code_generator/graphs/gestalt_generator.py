from typing import Annotated, TypedDict, Literal
from pathlib import Path
import json
from src.utils import to_serializable

# --- Project Imports ---
from src.ai_processing.code_generator.models.models import (
    Question,
)
from typing import Sequence

# --- LangChain / LangGraph ---
from langgraph.graph import START, StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from src.utils import save_graph_visualization, to_serializable
from src.ai_processing.code_generator.graphs.question_metadata_graph import (
    QuestionMetaData,
)
from langgraph.types import Command
from src.ai_processing.code_generator.graphs.question_html_graph import (
    app as question_html_generator,
)
from src.ai_processing.code_generator.graphs.server_js_graph import (
    app as server_js_generator,
)
from src.ai_processing.code_generator.graphs.server_py_graph import (
    app as server_py_generator,
)
from src.ai_processing.code_generator.graphs.solution_html_graph import (
    app as solution_html_generator,
)
from src.ai_processing.code_generator.graphs.question_metadata_graph import (
    app as question_metadata_generator,
)

memory = MemorySaver()
config = {"configurable": {"thread_id": "customer_123"}}


class State(TypedDict):
    question: Question
    metadata: QuestionMetaData | None
    # Append any files
    files: Annotated[dict, lambda a, b: {**a, **b}]


def classify_question(state: State) -> Command[Literal["generate_question_html"]]:
    input_state = {"question": state["question"], "metadata": None}
    result = question_metadata_generator.invoke(input_state, config)  # type: ignore
    return Command(
        update={
            "metadata": result["metadata"],
        },
        goto="generate_question_html",
    )


def generate_question_html(
    state: State,
) -> Command[
    Sequence[
        Literal["generate_solution_html", "generate_server_js", "generate_server_py"]
    ]
]:
    metadata = state["metadata"]
    assert metadata
    input_state = {
        "question": state["question"],
        "question_type": metadata.question_type,
        "question_html": None,
        "retrieved_documents": [],
        "formatted_examples": "",
    }
    result = question_html_generator.invoke(input_state, config)  # type: ignore
    files = {"question.html": result["question_html"]}
    metadata = state["metadata"]

    updated_question = state["question"].model_copy(
        update={"question_html": result["question_html"]}
    )

    assert metadata
    if metadata.question_type == "computational":
        return Command(
            update={"files": files, "question": updated_question},
            goto=["generate_server_py", "generate_server_js", "generate_solution_html"],
        )
    else:
        return Command(
            update={"files": files, "question": updated_question},
            goto=["generate_solution_html"],
        )


def generate_solution_html(state: State) -> Command:
    metadata = state["metadata"]
    assert metadata
    input_state = {
        "question": state["question"],
        "question_type": metadata.question_type,
        "solution_html": None,
        "retrieved_documents": [],
        "formatted_examples": "",
    }
    result = solution_html_generator.invoke(input_state, config)  # type: ignore
    files = {"solution.html": result["solution_html"]}
    return Command(
        update={"files": files},
    )


def generate_server_js(state: State) -> Command:
    metadata = state["metadata"]
    assert metadata
    input_state = {
        "question": state["question"],
        "question_type": metadata.question_type,
        "server_js": None,
        "retrieved_documents": [],
        "formatted_examples": "",
    }
    result = server_js_generator.invoke(input_state, config)  # type: ignore
    files = {"server.js": result["server_js"]}
    return Command(
        update={"files": files},
    )


def generate_server_py(state: State) -> Command:
    metadata = state["metadata"]
    assert metadata
    input_state = {
        "question": state["question"],
        "question_type": metadata.question_type,
        "server_js": None,
        "retrieved_documents": [],
        "formatted_examples": "",
    }
    result = server_py_generator.invoke(input_state, config)  # type: ignore
    files = {"server.py": result["server_py"]}
    return Command(
        update={"files": files},
    )


def generate_info_json(state: State) -> Command:
    metadata = state["metadata"]
    assert metadata
    info_metadata = metadata.model_dump()
    info_metadata["ai_generated"] = True

    # Create the info.json file this is the metadata associated with the database as well
    if metadata.question_type == "computational":
        info_metadata["languages"] = ["javascript", "python"]
        files = {"info.json": json.dumps(to_serializable(info_metadata))}
        return Command(update={"files": files})
    else:
        info_metadata["languages"] = []
        files = {"files": json.dumps(to_serializable(info_metadata))}
        return Command(update={"files": files})


def router(
    state: State,
) -> Sequence[
    Literal["generate_solution_html", "generate_server_js", "generate_server_py"]
]:
    metadata = state["metadata"]
    assert metadata
    if metadata.question_type == "computational":
        return ["generate_server_py", "generate_server_js", "generate_solution_html"]
    else:
        return ["generate_solution_html"]


# Build the graph

graph = StateGraph(State)

graph.add_node("classify_question", classify_question)
graph.add_node("generate_question_html", generate_question_html)
graph.add_node("generate_solution_html", generate_solution_html)
graph.add_node("generate_server_js", generate_server_js)
graph.add_node("generate_server_py", generate_server_py)
graph.add_node("generate_info_json", generate_info_json)

graph.add_edge(START, "classify_question")
graph.add_edge("classify_question", "generate_question_html")

# Add the path mapping here
graph.add_conditional_edges(
    "generate_question_html",
    router,
    {
        "generate_solution_html": "generate_solution_html",
        "generate_server_js": "generate_server_js",
        "generate_server_py": "generate_server_py",
    },
)

graph.add_edge("generate_server_js", "generate_info_json")
graph.add_edge("generate_server_py", "generate_info_json")
graph.add_edge("generate_solution_html", "generate_info_json")

graph.add_edge("generate_info_json", END)


memory = MemorySaver()
app = graph.compile(checkpointer=memory)
if __name__ == "__main__":
    config = {"configurable": {"thread_id": "customer_123"}}
    question = Question(
        question_text="A car is traveling along a straight rode at a constant speed of 100mph for 5 hours calculate the total distance traveled",
        solution_guide=None,
        final_answer=None,
        question_html="",
    )
    input_state: State = {"question": question, "metadata": None, "files": {}}
    result = app.invoke(input_state, config=config)  # type: ignore

    # Save output
    output_path = Path(r"src/ai_processing/code_generator/outputs/gestalt_generator")
    save_graph_visualization(app, output_path, filename="gestalt_generator_graph.png")
    data_path = output_path / "output.json"
    data_path.write_text(json.dumps(to_serializable(result)))

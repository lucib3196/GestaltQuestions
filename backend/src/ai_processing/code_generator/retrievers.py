import faiss
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from pathlib import Path
from pathlib import Path
from typing import Any, cast
from functools import lru_cache
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_core.messages import AIMessageChunk
from langchain.tools import tool
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

from src.ai_base.settings import get_settings
from src.utils import save_graph_visualization


# Get settings
settings = get_settings()
embedding_model = settings.embedding_model
base_model = settings.base_model
embeddings = OpenAIEmbeddings(model=settings.embedding_model)


# Helper for loading
def load(path: str, name: str):
    try:
        return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
    except Exception as e:
        raise RuntimeError(
            f"Failed to load vectorstore '{name}' at '{path}'. Error: {e}"
        )


# --- Manually defined vectorstore paths ---
JS_STORE_PATH = r"src/ai_processing/code_generator/vectorstores/js_store"
PY_STORE_PATH = r"src/ai_processing/code_generator/vectorstores/python_store"
QUESTION_STORE_PATH = r"src/ai_processing/code_generator/vectorstores/question_store"
SOLUTION_STORE_PATH = r"src/ai_processing/code_generator/vectorstores/solution_store"


# --- Manually loaded vectorstores ---
server_js_vectorstore = load(JS_STORE_PATH, "server_js_vectorstore")
server_py_vectorstore = load(PY_STORE_PATH, "server_py_vectorstore")
question_html_vectorstore = load(QUESTION_STORE_PATH, "question_html_vectorstore")
solution_vectorstore = load(SOLUTION_STORE_PATH, "solution_vectorstore")




@tool
def retrieve_python_context(query: str, computational: bool):
    """
    Retrieve Python-related context from the Python vectorstore.

    Use this tool when:
    - The query involves Python code, server.py
    - You need reference examples for Python execution or code synthesis.
    - The question planner must reason about Python runtime logic.
    """
    retrieved_docs = server_py_vectorstore.similarity_search(
        query, k=3, filter={"isAdaptive": computational}
    )
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\nContent: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs


def retrieve_question_context(query: str, computational: bool):
    """
    Retrieve question HTML templates and structures from the Question vectorstore.

    Use this tool when:
    - The system needs existing question patterns or templates.
    - You are generating new HTML-based questions or panels.
    - You want to retrieve formatting styles, question layouts, or structure.
    """
    retrieved_docs = question_html_vectorstore.similarity_search(
        query, k=3, filter={"isAdaptive": computational}
    )
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\nContent: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs


def retrieve_solution_context(query: str, computational: bool):
    """
    Retrieve solution HTML and reasoning examples from the Solution vectorstore.

    Use this tool when:
    - You need patterns for step-by-step solutions.
    - The question planner wants to reference prior solution structures.
    - You want to retrieve formatting styles, question layouts, or structure.
    """
    retrieved_docs = solution_vectorstore.similarity_search(
        query, k=3, filter={"isAdaptive": computational}
    )
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\nContent: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs


tools = [
    retrieve_js_context,
    retrieve_python_context,
    retrieve_question_context,
    retrieve_solution_context,
]

prompt = r"""You are an AI assistant specialized in generating educational content files for engineering and physics questions. 
Your task is to produce four types of files for each problem:

1. question.html — The student-facing question with formatting, figures, and inputs.
2. server.js — The JavaScript runtime logic used for computing parameters and validating answers.
3. server.py — The Python equivalent runtime logic.
4. solution.html — A full step-by-step solution for the question, including derivations and final results.

You have access to several vectorstores, each containing high-quality reference examples for how these files should be structured. 
You MUST use the appropriate vectorstore depending on what you are generating.

### Vectorstore Usage Guidelines

- **Question HTML Vectorstore (`question_html_vectorstore`)**
  - Use this to retrieve examples of question phrasing, structure, formatting, inputs, and common HTML patterns.
  - This vectorstore takes a *natural language question* as input.
  - Always query this store first before generating any file.
  - Output: question.html

- **JavaScript Vectorstore (`server_js_vectorstore`)**
  - Use when generating server.js.
  - Takes the *generated question.html* as input.
  - Retrieve examples of:
    - Parameter generation
    - Randomization
    - Numeric validation logic
    - Returning correct answers & intermediate reasoning

- **Python Vectorstore (`server_py_vectorstore`)**
  - Use when generating server.py.
  - Takes the *generated question.html* as input.
  - Retrieve examples of:
    - Parameter generation
    - Python calculations
    - Sigfigs, rounding, validation
    - Correct answer outputs

- **Solution HTML Vectorstore (`solution_vectorstore`)**
  - Use when generating solution.html.
  - Takes the *generated question.html* as input.
  - Retrieve examples of:
    - Step-by-step reasoning
    - Derivations and intermediate steps
    - Mathematical formatting
    - How to structure final answers

### Workflow Requirements

1. **Start with the natural-language question.**
2. Query the **question HTML vectorstore** to retrieve relevant formatting examples.
3. Generate a high-quality **question.html**.
4. Use the question.html file as input to:
   - Query the **JS vectorstore** → generate server.js
   - Query the **Python vectorstore** → generate server.py
   - Query the **Solution vectorstore** → generate solution.html
5. All generated files must be consistent with each other:
   - Same variable names
   - Same parameters
   - Same correct answers
   - Same reasoning

### Output Rules

- Always produce clean, minimal, functional code.
- Do NOT hallucinate extra variables or inconsistent naming.
- Follow the structure of retrieved examples as closely as possible.
- If vectorstore examples reveal multiple patterns, choose the one most consistent with the question.
- Each file should be self-contained and ready to run.

Your goal is to generate professional-grade educational files by combining:
- The input question
- Retrieved examples from vectorstores
- Consistent computations across all files
"""

agent = create_agent("gpt-5", tools=tools, system_prompt=prompt)


if __name__ == "__main__":
    query = "I want to create a question on the following 'A car is traveling along a straight path, at a constant speed of 40 mph what is the total distance traveled after 5 hours'"
    for event in agent.stream(
        {"messages": [{"role": "user", "content": query}]},
        stream_mode="values",
    ):
        event["messages"][-1].pretty_print()

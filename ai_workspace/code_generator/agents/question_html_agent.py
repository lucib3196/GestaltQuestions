# --- LangChain & OpenAI ---
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import OpenAIEmbeddings

# --- Pydantic ---
from pydantic import BaseModel

# --- Project Imports ---
from src.ai_base.settings import get_settings
from src.ai_processing.code_generator.utils import load_vectorstore
from src.ai_processing.code_generator.prompts import QUESTION_HTML_PROMPT

# Get settings
settings = get_settings()
embedding_model = settings.embedding_model
base_model = settings.base_model
embeddings = OpenAIEmbeddings(model=settings.embedding_model)

QUESTION_STORE_PATH = r"src/ai_processing/code_generator/vectorstores/question_store"
question_html_vectorstore = load_vectorstore(
    QUESTION_STORE_PATH, name="question_html_vectorstore", embeddings=embeddings
)

@tool
def retrieve_question_context(question: str, computational: bool):
    """
    Retrieve high-quality question HTML examples from the Question vectorstore.

    This tool takes a *complete natural-language question* as input and returns:
    - HTML question templates
    - Structuring patterns
    - Input components
    - Accepted formatting styles
    - Common panel layouts and markup conventions

    Use this tool when:
    - You are generating a new question.html file.
    - You need reference examples for how question files are structured.
    - You want to follow established formatting patterns, HTML structure,
      or input/parameter styles used in previous questions.

    The retrieved examples should guide the final HTML output, ensuring
    the generated question.html file is consistent, readable, and aligned
    with existing patterns in the system.
    """
    retrieved_docs = question_html_vectorstore.similarity_search(
        question, k=3, filter={"isAdaptive": computational}
    )
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\nContent: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs

tools = [retrieve_question_context]
agent = create_agent("gpt-5", tools=tools, system_prompt=QUESTION_HTML_PROMPT)

if __name__ == "__main__":
    print("Interactive Agent Chat\nType 'exit' to quit.\n")

    while True:
        user_input = input("You: ")

        if user_input.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break

        # Stream the agent's response
        for event in agent.stream(
            {"messages": [{"role": "user", "content": user_input}]},
            stream_mode="values",
        ):
            event["messages"][-1].pretty_print()

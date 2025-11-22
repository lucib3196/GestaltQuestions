# --- LangChain & OpenAI ---
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import OpenAIEmbeddings
from langchain.chat_models import init_chat_model
# --- Pydantic ---
from pydantic import BaseModel

# --- Project Imports ---
from ai_workspace.ai_base.settings import get_settings
from ai_workspace.utils import load_vectorstore
from ai_workspace.code_generator.prompts import QUESTION_HTML_PROMPT

# Get settings
settings = get_settings()
embedding_model = settings.embedding_model
base_model = settings.base_model
embeddings = OpenAIEmbeddings(model=settings.embedding_model)
model = init_chat_model(model=base_model.model, model_provider=base_model.provider)
QUESTION_STORE_PATH = r"ai_workspace\code_generator\vectorstores\question_store"
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

agent = create_agent(model, tools=tools, system_prompt=QUESTION_HTML_PROMPT,)

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

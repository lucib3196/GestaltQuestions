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

vector_store_path = (
    Path(r"src/ai_processing/code_generator/vectorstores/question_store")
    .resolve()
    .as_posix()
)
embeddings = OpenAIEmbeddings(model=settings.embedding_model)


try:
    vectorstore = FAISS.load_local(
        vector_store_path, embeddings, allow_dangerous_deserialization=True
    )
except Exception as e:
    raise RuntimeError(
        f"Failed to load topic classification FAISS vectorstore at "
        f"{vector_store_path}. Error: {e}"
    )


result = vectorstore.similarity_search(
    "A car is traveling a long a straigh path what is the total distance traveled"
)

retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 1},
)

result = retriever.invoke("A force is applied on a perpendicular area")
print(result)


import requests
from langchain.tools import tool
from langchain.chat_models import init_chat_model
from langchain.agents import create_agent


@tool(response_format="content_and_artifact")
def retrieve_context(query: str, computational: bool):
    """Retrieve information to help answer a query."""
    retrieved_docs = vectorstore.similarity_search(
        query, k=3, filter={"isAdaptive": computational}
    )
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\nContent: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs


prompt = r"""You have access to a tool which shows how to represent a question to an html representation of it 
this file is called question.html. For this file you need first determine if the question is computatinal or not 
this means that the question contains some sorth of computational. If the question is computational
we would want to replace the parameters of the question using {{params.value}} placeholder where the value is the name 
of the variable. This will be used later to inject values using javascript of python values. If the question is not 
computational then it is a simple static question that would not require any dynamic parameters
"""
tools = [retrieve_context]
model = init_chat_model(
    settings.base_model.model,
    model_provider=settings.base_model.provider,
)
agent = create_agent(model, tools, system_prompt=prompt)

if __name__ == "__main__":
    query = "I want to create a question on the following 'A car is traveling along a straight path, at a constant speed of 40 mph what is the total distance traveled after 5 hours'"
    for event in agent.stream(
        {"messages": [{"role": "user", "content": query}]},
        stream_mode="values",
    ):
        event["messages"][-1].pretty_print()

import json
import operator
from typing import Annotated, List

from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langgraph.graph import END, START, StateGraph
from langgraph.runtime import Runtime
from langgraph.types import Command
from pydantic import BaseModel

from gestalt_code_generator.model import (
    CodeArtifact,
    CodeResponse,
    ContextSchema,
    ExampleColumn,
    Question,
)
from gestalt_code_generator.utils import to_serializable


class State(BaseModel):
    # Required fields
    question: Question
    prompt: str
    source_example_col: ExampleColumn
    target_example_col: ExampleColumn

    # Storing the retrieved examples and formatted
    formatted_examples: str | None = None
    retrieved_documents: Annotated[List[Document], operator.add] = []
    code: CodeArtifact | None = None

    # Additional Configuration
    k: int = 2
    testing: bool = False


def retrieve_examples(state: State, runtime: Runtime[ContextSchema]):
    source_question = state.question.text
    # Construct filter
    filter = {
        "isAdaptive": state.question.is_adaptive,
        "input_col": state.source_example_col,
        "output_col": state.target_example_col,
        "output_is_nan": False,  # Prevent null columns from being present
    }
    # Used for inmemory vectorstore, requires specific logic for it
    if state.testing:

        def metadata_matches(metadata_filter: dict):
            def filter_func(doc: Document) -> bool:
                return all(
                    doc.metadata.get(key) == value
                    for key, value in metadata_filter.items()
                )

            return filter_func

        results = runtime.context.vectorstore.similarity_search(
            query=source_question,
            k=state.k,
            filter=metadata_matches(filter),
        )
    else:
        results = runtime.context.vectorstore.similarity_search(
            query=source_question, k=state.k, filter=filter
        )
    formatted_docs = "\n".join(p.page_content for p in results)
    return Command(
        update={"formatted_examples": formatted_docs, "retrieved_documents": results},
        goto="generate_code",
    )


def generate_code(state: State, runtime: Runtime[ContextSchema]):
    original_question = state.question.text
    examples = state.formatted_examples
    base_prompt = state.prompt

    base_prompt += f"""
    question: {original_question}\n
    examples: {examples}
    """
    model = init_chat_model(
        model=runtime.context.model, model_provider=runtime.context.model_provider
    ).with_structured_output(CodeResponse)
    code = model.invoke(base_prompt)
    code = CodeResponse.model_validate(code).code
    return {"code": CodeArtifact(filename=state.target_example_col, content=code)}


builder = StateGraph(State, context_schema=ContextSchema)
builder.add_node("retriever", retrieve_examples)
builder.add_node("generate_code", generate_code)
builder.add_edge(START, "retriever")
builder.add_edge("retriever", "generate_code")
builder.add_edge("generate_code", END)

graph = builder.compile()

if __name__ == "__main__":
    from pathlib import Path

    from dotenv import load_dotenv
    from langchain_core.vectorstores import InMemoryVectorStore

    from gestalt_code_generator.document_loader import QuestionDocumentLoader

    load_dotenv()
    csv_path = Path(
        r"gestalt_code_generator/data/QuestionDataV2_06122025_classified.csv"
    ).resolve()
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vector_store = InMemoryVectorStore(embeddings)
    loader = QuestionDocumentLoader(
        input_col="question", output_col="question.html", csv_path=csv_path
    )
    docs = list(loader.lazy_load())
    vector_store.add_documents(docs)
    results = vector_store.as_retriever().invoke(
        "A car is traveling along a straight rode"
    )
    result = graph.invoke(
        State(
            question=Question(
                text="A car is traveling along a straight rode at a constant speed of 100mph for 5 hours what is the total distance covered"
            ),
            prompt="Generate a question.html file for the following",
            source_example_col="question",
            target_example_col="question.html",
            testing=True,
        ),
        context=ContextSchema(
            model="gemini-2.5-flash",
            model_provider="google_genai",
            vectorstore=vector_store,
        ),
    )
    Path("./output").write_text(json.dumps(to_serializable(result), indent=2))

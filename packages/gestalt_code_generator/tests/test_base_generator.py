import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from gestalt_code_generator.document_loader import QuestionDocumentLoader
from gestalt_code_generator.graphs.base_generator import (
    ContextSchema,
    Question,
    State,
)
from gestalt_code_generator.graphs.base_generator import (
    graph as BaseGenerator,
)

ENV_PATH = Path(__file__).resolve().parents[1] / "src" / ".env"
load_dotenv(ENV_PATH)

API_KEY = os.getenv("GOOGLE_API_KEY", None)
if not API_KEY:
    raise ValueError("GOOGLE API KEY must be set for test")


def build_vectorstore_from_csv(question_data_csv_path: Path) -> InMemoryVectorStore:
    example_pairs = [
        ("question", "question.html"),
        ("question.html", "server.js"),
        ("question.html", "server.py"),
        ("question.html", "solution.html"),
    ]
    all_docs = []
    for inp, out in example_pairs:
        all_docs.extend(
            QuestionDocumentLoader(
                input_col=inp, output_col=out, csv_path=question_data_csv_path
            ).lazy_load()
        )
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vectorstore = InMemoryVectorStore(embedding=embeddings)
    vectorstore.add_documents(all_docs)
    return vectorstore


@pytest.fixture(scope="session")
def vectorstore(question_data_csv_path: Path) -> InMemoryVectorStore:
    return build_vectorstore_from_csv(question_data_csv_path)


@pytest.mark.parametrize(
    ("input_col", "output_col"),
    [
        ("question", "question.html"),
        ("question.html", "server.js"),
        ("question.html", "server.py"),
        ("question.html", "solution.html"),
    ],
)
def test_base_retriever(input_col, output_col, vectorstore):
    result = BaseGenerator.invoke(
        State(
            question=Question(
                text="A car is traveling along a straight rode at a constant speed of 100mph for 5 hours what is the total distance covered"
            ),
            prompt=f"Generate a {output_col} file",
            source_example_col=input_col,
            target_example_col=output_col,
            testing=True,
        ),
        context=ContextSchema(
            model="gemini-2.5-flash",
            model_provider="google_genai",
            vectorstore=vectorstore,
        ),
    )

    # Some basic checks
    parsed = State.model_validate(result)
    # Verify that the code was actually generated
    assert parsed.code
    assert parsed.code.filename == output_col
    assert parsed.code.content

    assert len(parsed.retrieved_documents) > 0

from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from pathlib import Path
from ai_workspace.code_generator.document_loader import (
    QuestionModuleDocumentLoader,
)
from ai_workspace.ai_base.settings import get_settings

settings = get_settings()


def main(
    data_path: str | Path, path_to_save: str | Path, input_col: str, output_col: str
):
    # Ensure paths are okay
    data_path = Path(data_path).resolve()
    path_to_save = Path(path_to_save).resolve().as_posix()

    loader = QuestionModuleDocumentLoader(data_path, input_col, output_col)
    docs = loader.load()
    embeddings = OpenAIEmbeddings(model=settings.embedding_model)
    vectorstore = FAISS.from_documents(docs, embeddings)

    vectorstore.save_local(path_to_save)


if __name__ == "__main__":
    # This is the base path for all the vectorstores that we are going to use
    base_path = r"src/ai_processing/code_generator/vectorstores"
    data_path = (
        r"src/ai_processing/code_generator/data/QuestionDataV2_06122025_classified.csv"
    )
    # These follow the input output pair
    example_pairs = [
        ("question", "question.html", "question_store"),
        ("question.html", "server.js", "js_store"),
        ("question.html", "server.py", "python_store"),
        ("question.html", "solution.html", "solution_store"),
    ]
    for ex in example_pairs:
        path_to_save = Path(base_path) / ex[2]
        print(f"Generating Vector Store {ex[2]}")
        main(data_path, path_to_save, ex[0], ex[1])
        print("Save Success")
    print("Generated all vectorstores succesfully")

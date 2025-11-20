from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings


# Helper for loading
def load_vectorstore(path: str, name: str,embeddings:OpenAIEmbeddings):
    try:
        return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
    except Exception as e:
        raise RuntimeError(
            f"Failed to load vectorstore '{name}' at '{path}'. Error: {e}"
        )
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.messages import SystemMessage


def extract_langsmith_prompt(base) -> str:
    try:
        if not isinstance(base, ChatPromptTemplate):
            raise ValueError("expected a ChatPromptTemplate")

        if not base.messages:
            raise ValueError("ChatPromptTemplate.messages is empty")

        messages = base.messages[0]
        if hasattr(messages, "prompt") and getattr(messages, "prompt") is not None and hasattr(messages.prompt, "template"):  # type: ignore
            template = messages.prompt.template  # type: ignore
        elif isinstance(messages, SystemMessage):
            template = messages.content
            if isinstance(template, list):
                template = template[0]
        else:
            raise ValueError(f"Unsupported message type: {type(messages).__name__}")

        return template # type: ignore

    except Exception as e:
        raise ValueError(f"Could not extract prompt {str(e)}")


# Helper for loading
def load_vectorstore(path: str, name: str, embeddings: OpenAIEmbeddings):
    try:
        return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
    except Exception as e:
        raise RuntimeError(
            f"Failed to load vectorstore '{name}' at '{path}'. Error: {e}"
        )

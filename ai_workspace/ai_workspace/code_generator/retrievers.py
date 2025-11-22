from src.ai_processing.utils import load_vectorstore
from ai_workspace.ai_base.settings import get_settings

# --- LangChain / OpenAI ---
from langchain_openai import OpenAIEmbeddings

# ---------------------------------------------------------------------
# Configuration & Embeddings
# ---------------------------------------------------------------------
settings = get_settings()

embeddings = OpenAIEmbeddings(model=settings.embedding_model)

# ---------------------------------------------------------------------
# Vectorstore Paths
# ---------------------------------------------------------------------
QUESTION_STORE_PATH = "src/ai_processing/code_generator/vectorstores/question_store"
JS_STORE_PATH = "src/ai_processing/code_generator/vectorstores/js_store"
PY_STORE_PATH = "src/ai_processing/code_generator/vectorstores/python_store"
SOLUTION_STORE_PATH = "src/ai_processing/code_generator/vectorstores/solution_store"

# ---------------------------------------------------------------------
# Loaded Vectorstores
# ---------------------------------------------------------------------
question_html_vectorstore = load_vectorstore(
    QUESTION_STORE_PATH,
    name="question_html_vectorstore",
    embeddings=embeddings,
)

server_js_vectorstore = load_vectorstore(
    JS_STORE_PATH,
    name="server_js_store",
    embeddings=embeddings,
)

server_py_vectorstore = load_vectorstore(
    PY_STORE_PATH,
    name="server_py_store",
    embeddings=embeddings,
)

solution_html_vectorstore = load_vectorstore(
    SOLUTION_STORE_PATH,
    name="solution_store",
    embeddings=embeddings,
)

from backend.api.accounts.users import user_routes
from backend.api.developer.router import router as dev_router
from backend.api.general import routes as general_routes
from backend.api.health import health_routes
from backend.api.langchain.langchain import router as agent_router
from backend.api.question_tables import router as question_tables_router
from backend.api.questions import qcrud_router
from backend.api.run_question import RUNTIME_ROUTES
from backend.api.threads import router as chat_router

ALL_ROUTES = [
    *user_routes,
    question_tables_router,
    agent_router,
    qcrud_router,
    chat_router,
    *general_routes,
    *RUNTIME_ROUTES,
    *health_routes,
    dev_router,
]

__all__ = ["ALL_ROUTES"]

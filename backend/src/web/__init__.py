from src.web.questions import routes as question_routes
from src.web.sandbox import router as sandbox_router
from src.web.run_question import router as runq_router
from src.web.user import router

routes = [sandbox_router, runq_router, router]

routes.extend(
    question_routes,
)

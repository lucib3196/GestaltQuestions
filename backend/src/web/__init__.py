from src.web.sandbox import router as sandbox_router

# from src.web.run_question import router as runq_router
from src.web.user.user import router as user_router
from src.web.user.health import router as user_health_route
from src.web.user.developer import router as user_dev_router
from src.web.question_manager.question_manager import router as developer_question_router
from src.web.general import routes as general_routes

ALL_ROUTES = [
    sandbox_router,
    user_router,
    user_health_route,
    user_dev_router,
    developer_question_router,
] + general_routes

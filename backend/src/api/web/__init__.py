from .questions.init import routes as questions_routes
from .startup import router as general_router
from .runner.run_question_server import router as question_runner
from .generic import routes as generic_routes
from .user import router as user_route
from .code_generation.code_generation import router as cgen

routes = [general_router, question_runner, user_route, cgen]

routes.extend(questions_routes)
routes.extend(generic_routes)

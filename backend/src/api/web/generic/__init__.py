from .files import router as file_router
from .sandbox_execution import router as sandbox_test

routes = [file_router,sandbox_test]
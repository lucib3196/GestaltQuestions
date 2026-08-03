from fastapi import APIRouter

from backend.api.developer import profile, question_access, question_manager, roles

router = APIRouter(prefix="/developer", tags=["Developer"])
router.include_router(profile.router)
router.include_router(question_access.router)
router.include_router(question_manager.router)
router.include_router(roles.router)

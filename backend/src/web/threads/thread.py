from fastapi.routing import APIRouter
from uuid import UUID

from .dependencies import ThreadDBDependency, MessageDBDependency
from src.model.thread import Thread, Message, MessageCreate
from fastapi.exceptions import HTTPException
from starlette import status
from src.web.user.dependencies import CurrentUser
from typing import List

router = APIRouter(prefix="/threads", tags=["threads"])


@router.post("/{thread_id}", response_model=Thread)
async def create_thread(
    thread_id: str | UUID,
    tdb: ThreadDBDependency,
    user: CurrentUser,
) -> Thread:
    return await tdb.create_thread(
        user_id=user,
        thread_id=thread_id,
    )


@router.post("/{thread_id}/messages", response_model=Message)
async def create_message(
    thread_id: UUID | str,
    data: List[MessageCreate],
    mdb: MessageDBDependency,
    tdb: ThreadDBDependency,
) -> None:
    try:
        for m in data:
            msg = await mdb.create_message(
                thread_id=thread_id,
                role=m.role,
                content=m.content,
            )
            await tdb.touch_updated_at(thread_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create the message {e}",
        )


# @router.get("/", response_model=list[Thread])
# async def list_threads(
#     data: ThreadList,
#     tdb: ThreadDBDependency,
#     user: StudentDep,
# ) -> list[Thread]:
#     return await tdb.list_threads_for_user(
#         user_id=data.user_id,
#         course_id=data.course_id,
#     )


# @router.get("/{thread_id}", response_model=Thread)
# async def get_thread(
#     thread_id: UUID | str,
#     tdb: ThreadDBDependency,
#     user: StudentDep,
# ) -> Thread:
#     return await tdb.get_thread(thread_id)


# @router.get("/{thread_id}/messages", response_model=list[Message])
# async def list_messages(
#     thread_id: UUID,
#     mdb: MessageDBDependency,
#     user: StudentDep,
# ) -> list[Message]:
#     return await mdb.list_messages(thread_id)

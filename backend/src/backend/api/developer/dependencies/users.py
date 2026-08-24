from typing import Annotated

from fastapi import Depends

from backend.accounts.users import UserLookup
from backend.api.dependencies.core import SessionDep


def get_user_lookup(session: SessionDep) -> UserLookup:
    return UserLookup(session)


UserLookupDependency = Annotated[
    UserLookup,
    Depends(get_user_lookup),
]

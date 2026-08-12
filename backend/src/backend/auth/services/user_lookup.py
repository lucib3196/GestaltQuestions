from collections.abc import Sequence
from sqlalchemy import or_
from sqlmodel import Session, col, select
from backend.auth import Institution, User, UserReadError, UserRoles, Role
from typing import List



class UserLookup:
    def __init__(self, session: Session):
        self._session = session

    def find_users(
        self,
        roles: List[UserRoles],
        *,
        query: str | None = None,
        institution: Institution | None = None,
        offset: int = 0,
        limit: int = 100,
    ) -> Sequence[User]:
        try:
            stmt = select(User).where(User.roles.any(Role.name.in_(roles)))  # type: ignore
            if query:
                pattern = f"%{query.strip()}%"
                stmt = stmt.where(
                    or_(
                        col(User.username).ilike(pattern),
                        col(User.email).ilike(pattern),
                        col(User.first_name).ilike(pattern),
                        col(User.last_name).ilike(pattern),
                    )
                )
            if institution:
                stmt = stmt.where(User.institution == institution)
            stmt = stmt.offset(offset).limit(limit)
            return self._session.exec(stmt).all()
        except Exception as e:
            self._session.rollback()
            raise UserReadError(details=f"[DB] Failed to find users: {e}") from e

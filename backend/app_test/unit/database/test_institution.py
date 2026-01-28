import pytest
from src.database.repo import role as role_db

from app_test.mock_data import USERS
from src.api.core import logger
from src.database.models.users import (
    UserRoles,
    UserUpdate,
    ValidInstitutions,
)


@pytest.mark.parametrize(
    "institution",
    [ValidInstitutions.CPP, ValidInstitutions.NORCO, ValidInstitutions.UCR],
)
def test_set_user_institution(make_user, institution, db_session):
    inst = instituion_db.create_institution(db_session, institution)
    assert inst
    user = make_user()
    user = user_db.set_user_institution(user.id, institution, db_session)
    logger.debug(f"This is the returned user {user}")
    assert user
    assert user.institution.name == institution.value  # type: ignore
    assert user.institution_id == inst.id
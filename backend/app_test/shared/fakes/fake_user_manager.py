from types import SimpleNamespace
from uuid import uuid4


class FakeUserManager:
    def __init__(self) -> None:
        self.user = SimpleNamespace(id=uuid4())
        self.roles = []

    async def get_user(self, user_id):
        return self.user

    async def get_user_role(self, user_id):
        return self.roles
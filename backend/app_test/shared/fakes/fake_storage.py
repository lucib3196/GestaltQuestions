class FakeStorage:
    def __init__(self) -> None:
        pass

    def create_dir(self, target: str) -> str:
        return target

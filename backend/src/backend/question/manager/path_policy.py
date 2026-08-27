from backend.question.models import Question
import re
from pathlib import Path

_filename_safe_re = re.compile(r"[^A-Za-z0-9._-]+")


class QuestionStoragePathPolicy:
    def build_path(self, storage_base_path: str, question: Question) -> str:
        question_slug = self.safe_dir_name(
            question.title or "Untitled Question",
            max_length=80,
        )

        return (
            f"{storage_base_path.rstrip('/')}/questions/"
            f"{question_slug}_{str(question.id)[:8]}/"
        )

    @staticmethod
    def safe_dir_name(name: str | Path, max_length: int = 100) -> str:
        if isinstance(name, Path):
            name = name.as_posix()
        if name.endswith("-/") or name.endswith("-\\"):
            name = f"{name[:-2]}_"
        name = Path(name).name
        name = name.strip().replace(" ", "_")
        name = name.replace("-", "_")
        name = _filename_safe_re.sub("_", name)
        if not name or name.startswith("."):
            raise ValueError("Could not generate safe name")
        if len(name) > max_length:
            name = name[:max_length]
        return name

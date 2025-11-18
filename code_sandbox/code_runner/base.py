from abc import ABC, abstractmethod
from .models import ExecutionResult


class CodeRunner(ABC):
    @abstractmethod
    def run(self, code: str) -> ExecutionResult:
        """Actually executes the code and returns the output and the result and any logs"""
        raise NotImplementedError("run must be implemented by subclass")

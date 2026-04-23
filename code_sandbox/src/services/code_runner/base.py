from abc import ABC, abstractmethod
import copy

from subprocess import CompletedProcess
from .models import ExecutionResult, RuntimeExecutionConfig, Language


class CodeRunner(ABC):

    def __init__(self, runtime_config: RuntimeExecutionConfig, language: Language):
        self.runtime_config = copy.deepcopy(runtime_config)
        self.language = language
        self._validate_runtime()
        self._validate_entry_point()

    @abstractmethod
    def execute(self) -> CompletedProcess:
        """Executes the code using a subprocess, returns the raw result"""
        raise NotImplementedError("execute must be implemented by subclass")

    @abstractmethod
    def run(
        self,
    ) -> ExecutionResult:
        """Actually executes the code and returns the output and the result and any logs"""
        raise NotImplementedError("run must be implemented by subclass")

    def _validate_runtime(self):
        if self.runtime_config.language != self.language:
            raise ValueError(
                f"Runtime language mismatch: config expects '{self.runtime_config.language}' "
                f"but runner is '{self.language}'"
            )

    def _validate_entry_point(self):
        entry = self.runtime_config.entry
        if entry not in self.runtime_config.files:
            raise ValueError(
                f"Entry point '{entry}' not found in provided files. "
                f"Available: {list(self.runtime_config.files.keys())}"
            )

    def _get_entry_point(self) -> str:
        entry_point = self.runtime_config.entry
        content = self.runtime_config.files.get(entry_point, "")
        if not content:
            raise ValueError(f"Entry point {entry_point} is a empty file.")
        return content

    def _update_entry_point(self, content: str) -> str:
        entry_point = self.runtime_config.entry
        self.runtime_config.files[entry_point] = content
        return self.runtime_config.files[entry_point]

    def __str__(self) -> str:
        return f"{self.language} runner"

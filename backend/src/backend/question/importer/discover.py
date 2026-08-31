from abc import abstractmethod
from pathlib import Path
from typing import TypeVar

PackageT = TypeVar("PackageT")
DiscoverySpecT = TypeVar("DiscoverySpecT")


class QuestionPackageDiscoverer[PackageT, DiscoverySpecT]:
    """Base interface for discovering and caching question packages."""

    @abstractmethod
    def discover_packages(
        self,
        spec: DiscoverySpecT,
    ) -> dict[str, PackageT]:
        """Discover question packages from the backing source."""
        ...

    @abstractmethod
    def save_packages(
        self,
        packages: dict[str, PackageT],
        path: str | Path,
    ) -> None:
        """Save discovered packages to a reusable manifest."""
        ...

    @abstractmethod
    def load_packages(self, path: str | Path) -> dict[str, PackageT]:
        """Load packages from a previously saved manifest."""
        ...

    def pretty_print(self, packages: dict[str, PackageT]) -> None:
        """Print a compact summary of discovered packages."""
        print(f"Number of questions: {len(packages)}")
        for package_id, package in packages.items():
            files = getattr(package, "files", {})
            print(f"Package: {package_id}, num files: {len(files)}")
            for filename in files:
                print(f"\t->{filename}")

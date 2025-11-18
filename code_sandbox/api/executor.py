from pathlib import Path


def run():
    path = Path(r"api/test_code.py").resolve()
    return path.read_text()


if __name__ == "__main__":
    print("Running Docker Container")

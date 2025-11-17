from pathlib import Path


def main():
    path = Path(r"test_code.py").resolve()
    return path.read_text()


if __name__ == "__main__":
    print("Running Docker Container")

from typing import Union

FileContent = Union[str, dict, bytes]

TARGETS = [
    "questions/",
    "user1234/questions/content/",
    "data/user1234/content/question1/",
]

RENAME_TARGETS = [
    # Basic file rename
    ("questions/test1.txt", "questions/test1_renamed.txt"),
    # Nested file rename
    ("questions/content/q1.json", "questions/content/q1_v2.json"),
    # Folder rename
    ("questions/module1/", "questions/module1_updated/"),
    # Deep folder rename
    ("data/user123/content/question1/", "data/user123/content/question1_archive/"),
    # File inside nested folder
    ("data/user123/content/q1.pdf", "data/user123/content/q1_final.pdf"),
    # Root-level file
    ("root.txt", "root_renamed.txt"),
    # Root-level folder
    ("archive/", "archive_old/"),
    # Rename with different depth
    ("questions/temp/file.txt", "questions/file.txt"),
    # Rename moving into subfolder
    ("questions/file.txt", "questions/archive/file.txt"),
]


MOCK_FILES: list[tuple[str, FileContent]] = [
    ("text.txt", "Hello World"),  # simple string
    ("data.json", {"key": "value"}),  # dict → JSON case
    ("binary.bin", b"\x00\x01\x02"),  # raw bytes
    ("empty.txt", ""),  # empty string
    ("empty.json", {}),  # empty dict
    ("nested.json", {"a": {"b": [1, 2, 3]}}),  # nested structure
    ("unicode.txt", "こんにちは世界"),  # unicode string
    ("large.txt", "A" * 10_000),  # large text payload
    ("pdf_like.bin", b"%PDF-1.4\n%\xe2\xe3\xcf\xd3"),  # binary resembling file header
    ("path/to/file.txt", "Nested path content"),  # nested path
    ("folder/emptyfile", b""),  # empty bytes
]

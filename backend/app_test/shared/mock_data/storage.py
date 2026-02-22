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
    ("content/root.txt", "root_renamed.txt"),
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

FOLDER_ITERATION_TARGETS: list[tuple[str, list[tuple[str, FileContent]]]] = [
    (
        "questions/",
        [
            ("questions/a.txt", "A"),
            ("questions/b.json", {"x": 1}),
            ("questions/c.bin", b"\x00\x01"),
        ],
    ),
    (
        "data/user123/content/",
        [
            ("data/user123/content/q1.json", {"id": 1}),
            ("data/user123/content/q2.json", {"id": 2}),
            ("data/user123/content/deep/file.txt", "nested"),
        ],
    ),
    (
        "archive/",
        [
            ("archive/root.txt", "root file"),
            ("archive/sub/a.txt", "sub file"),
            ("archive/sub/b.txt", "another file"),
        ],
    ),
]

NON_RECURSIVE_FOLDER_ITERATION_TARGETS: list[
    tuple[str, list[tuple[str, FileContent]], list[str]]
] = [
    (
        "questions/",
        # Files to create
        [
            ("questions/a.txt", "A"),
            ("questions/b.json", {"x": 1}),
            ("questions/sub/c.txt", "nested"),
            ("questions/sub/deeper/d.txt", "deep nested"),
        ],
        # Expected results (non-recursive)
        [
            "questions/a.txt",
            "questions/b.json",
        ],
    ),
    (
        "data/user123/content/",
        [
            ("data/user123/content/q1.json", {"id": 1}),
            ("data/user123/content/q2.json", {"id": 2}),
            ("data/user123/content/deep/file.txt", "nested"),
        ],
        [
            "data/user123/content/q1.json",
            "data/user123/content/q2.json",
        ],
    ),
    (
        "archive/",
        [
            ("archive/root.txt", "root file"),
            ("archive/sub/a.txt", "sub file"),
            ("archive/sub/b.txt", "another file"),
            ("archive/sub/deeper/c.txt", "deep file"),
        ],
        [
            "archive/root.txt",
        ],
    ),
]
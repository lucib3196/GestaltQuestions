USERS = [
    {
        "first_name": "Alice",
        "last_name": "Smith",
        "username": "alice",
        "email": "alice@test.com",
    },
    {
        "first_name": "Bob",
        "last_name": "Jones",
        "username": "bob",
        "email": "bob@test.com",
    },
]

INVALID_USERS = [
    {
        "last_name": "Smith",
        "username": "alice",
        "email": "alice_test.com",
    },
    {
        "first_name": "Alice",
        "last_name": "Smith",
        "username": "alice",
        "email": "not-an-email",
    },
]
pytest_plugins = [
    "app_test.support.db",
    "app_test.support.firebase",
    "app_test.support.storage",
    "app_test.support.api",
    "app_test.support.questions",
    # Factories
    "app_test.factories.question_factory",
    "app_test.factories.user_factory",
]

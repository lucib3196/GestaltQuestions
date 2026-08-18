pytest_plugins = [
    "app_test.support.db",
    "app_test.support.firebase",
    "app_test.support.storage",
    "app_test.support.api",
    "app_test.support.questions",
    "app_test.support.developer",
    "app_test.support.question_collections",
    "app_test.support.user_manager",
    # Factories
    "app_test.factories.question_factory",
    "app_test.factories.user_factory",
    "app_test.factories.developer_factory",
]

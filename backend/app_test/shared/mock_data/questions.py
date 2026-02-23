QUESTIONS = [
    {
        "title": "Addition",
        "ai_generated": True,
        "isAdaptive": False,
        "base_path": "questions/",  # flat path
    },
    {
        "title": "Multiplication",
        "ai_generated": True,
        "isAdaptive": False,
        "base_path": "questions/math/",  # nested folder
    },
    {
        "title": "Division",
        "ai_generated": False,
        "isAdaptive": False,
        "base_path": "user123/questions/",  # user-scoped
    },
    {
        "title": "Bernoulli Equation",
        "ai_generated": True,
        "isAdaptive": True,
        "topics": ["Fluid Dynamics", "Flow Analysis"],
        "languages": ["javascript"],
        "qtypes": ["multiple-choice"],
        "question_path": "", # Empty string
    },
    {
        "title": "Thermodynamics First Law",
        "ai_generated": False,
        "isAdaptive": False,
        "topics": ["Thermodynamics", "Energy Balance"],
        "languages": ["python", "javascript"],
        "qtypes": ["conceptual"],
        "base_path": "mech/thermo/first_law/",
    },
    {
        "title": "Statics Basics",
        "ai_generated": True,
        "isAdaptive": True,
        "createdBy": "tester_mech",
        "user_id": 1,
        "topics": ["Mechanics", "Statics"],
        "languages": ["python"],
        "qtypes": ["numeric"],
        "base_path": "users/1/mechanics/statics/",
    },
    {
        "title": "Heat Transfer Conduction",
        "ai_generated": True,
        "isAdaptive": False,
        "topics": ["Heat Transfer"],
        "languages": ["python"],
        "qtypes": ["derivation"],
        "base_path": "deep/nested/path/for/testing/",
    },
]


QUESTION_GROUPS = [
    {"case": "single_question", "questions": [QUESTIONS[0]]},
    {"case": "multiple_questions", "questions": QUESTIONS},
    {
        "case": "multiple_questions_with_additional_meta",
        "questions": QUESTIONS,
    },
]

QUESTION_KEYS = {
    "title",
    "ai_generated",
    "isAdaptive",
}
METAKEYS = {"topics", "languages", "qtypes"}

QUESTION_FIELDS = {*QUESTION_KEYS, *METAKEYS}

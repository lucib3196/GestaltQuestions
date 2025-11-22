import math

def generate(use_predefined_values=0):
    # Function to generate values and compute results based on the order of operations

    # Predefined dataset if needed
    predefined_dataset = [
        {"expression1": 25, "expression2_1": 10, "expression2_2": 2.5, "complex_expression": 4},
        {"expression1": 25, "expression2_1": 10, "expression2_2": 2.5, "complex_expression": 4},
        {"expression1": 25, "expression2_1": 10, "expression2_2": 2.5, "complex_expression": 4},
        {"expression1": 25, "expression2_1": 10, "expression2_2": 2.5, "complex_expression": 4},
        {"expression1": 25, "expression2_1": 10, "expression2_2": 2.5, "complex_expression": 4}
    ]

    if use_predefined_values == 1:
        # Use predefined values for testing
        params = predefined_dataset[0]
    else:
        # Compute results using random generation
        # For this case, we can define expressions directly since values are known
        # Expression 1: 7 + 3 * (10 - 4)
        value_in_parentheses = 10 - 4  # Evaluates to 6
        multiplication_result = 3 * value_in_parentheses  # Evaluates to 18
        expression1_result = 7 + multiplication_result  # Evaluates to 25

        # Expression 2: 40 / 8 * 2 and 40 / (8 * 2)
        expression2_1_result = 40 / 8 * 2  # Evaluates to 10
        expression2_2_result = 40 / (8 * 2)  # Evaluates to 2.5

        # Complex Expression: 5^2 - (2 + 3) * (7 - 2) + 8 / 2
        exponent_value = 5 ** 2  # Evaluates to 25
        parentheses_result_1 = 2 + 3  # Evaluates to 5
        parentheses_result_2 = 7 - 2  # Evaluates to 5
        multiplication_result_complex = parentheses_result_1 * parentheses_result_2  # Evaluates to 25
        division_result = 8 / 2  # Evaluates to 4
        complex_expression_result = exponent_value - multiplication_result_complex + division_result  # Evaluates to 4

        # Store computed values in params
        params = {
            "expression1": expression1_result,
            "expression2_1": expression2_1_result,
            "expression2_2": expression2_2_result,
            "complex_expression": complex_expression_result
        }

    return {
        "params": params,
        "correct_answers": {
            "expression1": params["expression1"],
            "expression2_1": params["expression2_1"],
            "expression2_2": params["expression2_2"],
            "complex_expression": params["complex_expression"]
        },
        "nDigits": 3,
        "sigfigs": 3,
    }
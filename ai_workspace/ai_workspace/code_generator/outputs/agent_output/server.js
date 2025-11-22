const math = require("mathjs");

const generate = (usePredefinedValues = 0) => {
    // Dynamic Parameter Selection
    let questions = [];

    // Question 1: Simplifying Expressions
    const expression1 = "7 + 3 * (10 - 4)";
    const answer1 = evaluateExpression(expression1);

    // Question 2: Comparing Different Operations
    const expression2a = "40 / 8 * 2";
    const answer2a = evaluateExpression(expression2a);
    const expression2b = "40 / (8 * 2)";
    const answer2b = evaluateExpression(expression2b);

    // Question 3: Evaluating a Complex Expression
    const expression3 = "5^2 - (2 + 3) * (7 - 2) + 8 / 2";
    const answer3 = evaluateExpression(expression3);

    // Formatting results
    questions.push({
        question: "Evaluate: " + expression1,
        correct_answer: answer1
    });
    questions.push({
        question: "Evaluate: " + expression2a,
        correct_answer: answer2a
    });
    questions.push({
        question: "Evaluate: " + expression2b,
        correct_answer: answer2b
    });
    questions.push({
        question: "Evaluate: " + expression3,
        correct_answer: answer3
    });

    return {
        params: {
            expressions: questions.map(q => q.question)
        },
        correct_answers: {
            answers: questions.map(q => q.correct_answer)
        },
        intermediate: {
            expression1: { expression: expression1, result: answer1 },
            expression2a: { expression: expression2a, result: answer2a },
            expression2b: { expression: expression2b, result: answer2b },
            expression3: { expression: expression3, result: answer3 }
        },
        nDigits: 2,
        sigfigs: 2
    };
};

function evaluateExpression(expr) {
    return math.evaluate(expr);
}

module.exports = { generate };
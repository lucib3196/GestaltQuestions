function generate() {
  const a = 1;
  const b = 2;
  const sum = a + b;

  const data = { params: { a: a, b: b } };

  // Required logs for tests
  console.log("This is the value of a", a);
  console.log("This is the value of b", b);

  // First structure log
  console.log("Here is a structure", JSON.stringify({ a: a, b: b }));

  // Second structure log (JSON-like OR fallback key/value)
  console.log("Here is a structure", { a: a, b: b });

  // ❌ Intentional error: 'c' is not defined anywhere
  const brokenSum = a + c;

  return {
    params: { a: a, b: b },
    correct_answers: { sum: sum },
    intermediate: { step: `${a} + ${b} = ${sum}` },
    test_results: { pass: 1, message: "Addition successful" },

    // ❌ Using brokenSum triggers the error during execution
    nDigits: brokenSum,
    sigfigs: 3,
  };
}

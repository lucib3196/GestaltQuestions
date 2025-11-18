function generate(val = 0, another_val = 4) {
  const a = 1;
  const b = 2;
  const sum = a + b;

  data = { params: { a: a, b: b } };
  console.log("Hi");
  console.log("Got a val", val, another_val);

  return {
    params: { a: a, b: b },
    correct_answers: { sum: sum },
    intermediate: { step: `${a} + ${b} = ${sum}` },
    test_results: { pass: 1, message: "Addition successful" },
    nDigits: 3,
    sigfigs: 3,
  };
}

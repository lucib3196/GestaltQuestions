export function selectedOptions<T extends string>(
  value: unknown,
  validValues: readonly T[],
): T[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? [value]
      : [];

  return values.filter((item): item is T => validValues.includes(item as T));
}

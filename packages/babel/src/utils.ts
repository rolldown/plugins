export function arrayify<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

export function filterMap<T, U>(
  array: T[],
  predicate: (value: T, key: number) => { value: U } | undefined,
): U[] {
  const newArray: U[] = []
  for (const [index, item] of array.entries()) {
    const result = predicate(item, index)
    if (result) {
      newArray.push(result.value)
    }
  }
  return newArray
}

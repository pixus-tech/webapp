export type IndexableBoolean = number // Using a number because booleans are not indexable by indexeddb

export function toggleBooleanNumber(number: IndexableBoolean) {
  return (number + 1) % 2
}

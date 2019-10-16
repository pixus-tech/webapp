import positionBeforeIndex from './listIndex'

const MAX = Number.MAX_SAFE_INTEGER

it('suggests reordering when no free index is found', () => {
  const position = positionBeforeIndex([1, 2, 3], 1, 3)
  expect(position.shouldReorder).toBeTruthy()
  expect(position.index).toEqual(2)
})

it('ignores value of self', () => {
  const position = positionBeforeIndex([1, 2, 3], 2, 3)
  expect(position.shouldReorder).toBeFalsy()
  expect(position.index).toEqual(2)
})

it('handles max int cases', () => {
  const position = positionBeforeIndex([MAX, MAX, MAX], MAX, MAX)
  expect(position.shouldReorder).toBeFalsy()
  expect(position.index).toEqual(Math.floor(MAX / 2))
})

it('handles unsorted indices', () => {
  const position = positionBeforeIndex([1, 2, 5, 3, 9, 4], 1, 9)
  expect(position.shouldReorder).toBeFalsy()
  expect(position.index).toEqual(7)
})

it('finds the mid free index', () => {
  const position = positionBeforeIndex([0, 1, 10], 1, 10)
  expect(position.shouldReorder).toBeFalsy()
  expect(position.index).toEqual(5)
})

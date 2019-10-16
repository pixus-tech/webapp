interface Position {
  shouldReorder: boolean
  index: number
}

export default function positionBeforeIndex(
  numbers: number[],
  self: number,
  successor: number,
): Position {
  let maxPredecessor = 0

  numbers.forEach(i => {
    if (i < successor && i > maxPredecessor && i !== self) {
      maxPredecessor = i
    }
  })

  const shouldReorder = successor - maxPredecessor <= 1
  const index = Math.floor(maxPredecessor + (successor - maxPredecessor) / 2)

  return {
    shouldReorder,
    index,
  }
}

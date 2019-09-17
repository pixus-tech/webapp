import {
  encodeColor,
  encodeColors,
  decodeColors,
  Uint8BitColor,
} from './colors'

test('Properly encodes white', () => {
  const color: Uint8BitColor = [255, 255, 255]
  const serialization = encodeColor(color)
  expect(serialization).toEqual('ffffff')
})

test('Properly encodes black', () => {
  const color: Uint8BitColor = [0, 0, 0]
  const serialization = encodeColor(color)
  expect(serialization).toEqual('000000')
})

test('Properly encodes simple red', () => {
  const color: Uint8BitColor = [255, 0, 0]
  const serialization = encodeColor(color)
  expect(serialization).toEqual('ff0000')
})

test('Properly encodes complex green', () => {
  const color: Uint8BitColor = [52, 199, 89]
  const serialization = encodeColor(color)
  expect(serialization).toEqual('34c759')
})

test('Properly encodes simple blue', () => {
  const color: Uint8BitColor = [0, 0, 255]
  const serialization = encodeColor(color)
  expect(serialization).toEqual('0000ff')
})

test('Properly en- and decodes simple red, simple blue and complex green', () => {
  const red: Uint8BitColor = [255, 0, 0]
  const blue: Uint8BitColor = [0, 0, 255]
  const green: Uint8BitColor = [52, 199, 89]
  const serialization = encodeColors(red, blue, green)
  expect(serialization).toEqual('ff00000000ff34c759')
  expect(decodeColors(serialization)).toEqual([
    [255, 0, 0],
    [0, 0, 255],
    [52, 199, 89],
  ])
})

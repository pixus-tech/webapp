import { Buffer } from 'buffer'

import { assemble, chunk } from './fileChunker'

test('does not mess with buffers smaller than maxChunkSize', () => {
  const buffer = Buffer.from('abc', 'utf-8')
  expect(chunk(buffer, 3)).toEqual([buffer])
})

test('splits buffers larger than maxChunkSize into appropriate chunks', () => {
  const buffer = Buffer.from('abc', 'utf-8')
  expect(chunk(buffer, 1)).toEqual([
    Buffer.from('a', 'utf-8'),
    Buffer.from('b', 'utf-8'),
    Buffer.from('c', 'utf-8'),
  ])
})

test('splits buffers larger than maxChunkSize into appropriate chunks', () => {
  const buffer = Buffer.from('abc', 'utf-8')
  expect(chunk(buffer, 2)).toEqual([
    Buffer.from('ab', 'utf-8'),
    Buffer.from('c', 'utf-8'),
  ])
})

test('does not change a single buffer', () => {
  const buffer = Buffer.from('abc', 'utf-8')
  expect(assemble([buffer])).toEqual(buffer)
})

test('assembles chunked buffers correctly', () => {
  expect(
    assemble([
      Buffer.from('a', 'utf-8'),
      Buffer.from('b', 'utf-8'),
      Buffer.from('c', 'utf-8'),
    ]),
  ).toEqual(Buffer.from('abc', 'utf-8'))
})

test('assembles chunked buffers correctly', () => {
  expect(
    assemble([Buffer.from('ab', 'utf-8'), Buffer.from('c', 'utf-8')]),
  ).toEqual(Buffer.from('abc', 'utf-8'))
})

import { Buffer } from 'buffer'
import { Observable } from 'rxjs'

import {
  assemble,
  chunk,
  getAssembledChunks,
  putChunks,
  INDEX_PREFIX,
  INDEX_DELIMITER,
} from './fileChunker'

const buffers = {
  abc: Buffer.from('abc', 'utf-8'),
  a: Buffer.from('a', 'utf-8'),
  ab: Buffer.from('ab', 'utf-8'),
  b: Buffer.from('b', 'utf-8'),
  c: Buffer.from('c', 'utf-8'),
}

describe('chunk', () => {
  it('does not mess with buffers smaller than maxChunkSize', () => {
    expect(chunk(buffers.abc, 3)).toEqual([buffers.abc])
  })

  it('splits buffers larger than maxChunkSize into appropriate chunks', () => {
    expect(chunk(buffers.abc, 1)).toEqual([
      Buffer.from('a', 'utf-8'),
      Buffer.from('b', 'utf-8'),
      Buffer.from('c', 'utf-8'),
    ])
  })

  it('splits buffers larger than maxChunkSize into appropriate chunks', () => {
    expect(chunk(buffers.abc, 2)).toEqual([
      Buffer.from('ab', 'utf-8'),
      Buffer.from('c', 'utf-8'),
    ])
  })
})

describe('assemble', () => {
  it('does not change a single buffer', () => {
    expect(assemble([buffers.abc])).toEqual(buffers.abc)
  })

  it('assembles chunked buffers correctly', () => {
    expect(
      assemble([
        Buffer.from('a', 'utf-8'),
        Buffer.from('b', 'utf-8'),
        Buffer.from('c', 'utf-8'),
      ]),
    ).toEqual(buffers.abc)
  })

  it('assembles chunked buffers correctly', () => {
    expect(
      assemble([Buffer.from('ab', 'utf-8'), Buffer.from('c', 'utf-8')]),
    ).toEqual(buffers.abc)
  })
})

describe('putChunks', () => {
  const targetPath = '/target'
  const createUploader = (
    options: { maxSuccessCount: number } = {
      maxSuccessCount: Number.MAX_SAFE_INTEGER,
    },
  ) => {
    let requestCount = 0
    return jest.fn((path: string, payload: Buffer) => {
      const index = requestCount
      requestCount += 1
      return new Observable<string>(subscriber => {
        if (index < options.maxSuccessCount) {
          subscriber.next(`url${path}`)
          subscriber.complete()
        } else {
          subscriber.error('request failed')
        }
      })
    })
  }

  it('successfully puts a single buffer', done => {
    const uploader = createUploader()
    putChunks(targetPath, [buffers.abc], uploader).subscribe({
      next(publicURL) {
        expect(publicURL).toEqual('url/target')
        expect(uploader.mock.calls.length).toBe(1)
        done()
      },
      error(error) {
        done.fail(error)
      },
    })
  })

  it('adds an index file for split buffers', done => {
    const uploader = createUploader()
    putChunks(targetPath, [buffers.ab, buffers.c], uploader).subscribe({
      next(publicURL) {
        expect(publicURL).toEqual('url/target')
        expect(uploader.mock.calls.length).toBe(3)
        expect(uploader.mock.calls[2][1]).toBe(
          `${INDEX_PREFIX}${INDEX_DELIMITER}/target-0,/target-1`,
        )
        done()
      },
      error(error) {
        done.fail(error)
      },
    })
  })

  it('handles error for a single buffer', done => {
    const uploader = createUploader({ maxSuccessCount: 0 })
    putChunks(targetPath, [buffers.abc], uploader).subscribe({
      next() {
        done.fail('should not succeed')
      },
      error(error) {
        expect(error).toEqual('request failed')
        expect(uploader.mock.calls.length).toBe(1)
        done()
      },
    })
  })

  it('handles error in subsequent request when uploading multiple buffers', done => {
    const uploader = createUploader({ maxSuccessCount: 2 })
    putChunks(targetPath, [buffers.ab, buffers.c], uploader).subscribe({
      next() {
        done.fail('should not succeed')
      },
      error(error) {
        expect(error).toEqual('request failed')
        expect(uploader.mock.calls.length).toBe(3)
        done()
      },
    })
  })
})

describe('getAssembledChunks', () => {
  const sourcePath = '/source'
  const createDownloader = (
    source: (Buffer | string)[],
    options: { maxSuccessCount: number } = {
      maxSuccessCount: Number.MAX_SAFE_INTEGER,
    },
  ) => {
    let requestCount = 0
    return jest.fn((path: string) => {
      const index = requestCount
      requestCount += 1
      return new Observable<Buffer | string>(subscriber => {
        if (index < options.maxSuccessCount) {
          subscriber.next(source[index])
          subscriber.complete()
        } else {
          subscriber.error('request failed')
        }
      })
    })
  }

  it('successfully gets a single buffer', done => {
    const downloader = createDownloader([buffers.abc])
    getAssembledChunks(sourcePath, downloader).subscribe({
      next(buffer) {
        expect(buffer).toEqual(buffers.abc)
        expect(downloader.mock.calls.length).toBe(1)
        done()
      },
      error(error) {
        done.fail(error)
      },
    })
  })

  it('detects the index file and finds, fetches and assembles chunks', done => {
    const downloader = createDownloader([
      `${INDEX_PREFIX}${INDEX_DELIMITER}${sourcePath}-0,${sourcePath}-1`,
      buffers.ab,
      buffers.c,
    ])
    getAssembledChunks(sourcePath, downloader).subscribe({
      next(result) {
        expect(result).toEqual(buffers.abc)
        expect(downloader.mock.calls.length).toBe(3)
        expect(downloader.mock.calls[1][0]).toBe(`${sourcePath}-0`)
        expect(downloader.mock.calls[2][0]).toBe(`${sourcePath}-1`)
        done()
      },
      error(error) {
        done.fail(error)
      },
    })
  })

  it('handles error for a single buffer', done => {
    const downloader = createDownloader([buffers.abc], 0)
    getAssembledChunks(sourcePath, downloader).subscribe({
      next() {
        done.fail('should not succeed')
      },
      error(error) {
        expect(error).toEqual('request failed')
        expect(downloader.mock.calls.length).toBe(1)
        done()
      },
    })
  })

  it('handles error in subsequent request when downloading multiple buffers', done => {
    const downloader = createDownloader(
      [
        `${INDEX_PREFIX}${INDEX_DELIMITER}${sourcePath}-0,${sourcePath}-1`,
        buffers.ab,
        buffers.c,
      ],
      { maxSuccessCount: 2 },
    )
    getAssembledChunks(sourcePath, downloader).subscribe({
      next() {
        done.fail('should not succeed')
      },
      error(error) {
        expect(error).toEqual('request failed')
        expect(downloader.mock.calls.length).toBe(3)
        done()
      },
    })
  })
})

import _ from 'lodash'
import { Buffer } from 'buffer'
import { Observable, forkJoin } from 'rxjs'
import { DEFAULT_UPLOAD_FILE_CHUNK_SIZE } from 'constants/index'

export const INDEX_PREFIX = 'CHUNKS'
export const INDEX_DELIMITER = ':'
export const PREFIX_BUFFER = Buffer.from(INDEX_PREFIX)

export function assemble(buffers: (string | Buffer)[]): Buffer {
  return Buffer.concat(
    _.map(buffers, buffer => {
      if (typeof buffer === 'string') {
        return Buffer.from(buffer)
      }

      return buffer
    }),
  )
}

export function chunk(
  buffer: Buffer,
  maxChunkSize: number = DEFAULT_UPLOAD_FILE_CHUNK_SIZE,
): Buffer[] {
  if (buffer.byteLength <= maxChunkSize) {
    return [buffer]
  }

  const buffers: Buffer[] = []
  const chunkCount = Math.ceil(buffer.byteLength / maxChunkSize)

  for (let i = 0; i < chunkCount; i++) {
    const offset = i * maxChunkSize
    buffers.push(buffer.slice(offset, offset + maxChunkSize))
  }

  return buffers
}

export function putChunks(
  path: string,
  chunks: Buffer[],
  putChunk: (path: string, payload: string | Buffer) => Observable<string>,
) {
  return new Observable<string>(subscriber => {
    // Upload unchunked payload directly
    if (chunks.length === 1) {
      putChunk(path, chunks[0]).subscribe({
        next(publicURL) {
          subscriber.next(publicURL)
          subscriber.complete()
        },
        error(error) {
          subscriber.error(error)
        },
      })

      return
    }

    // Upload chunks separately and one index file that contains the paths
    // comma separated
    const paths = []
    const parts: [string, string | Buffer][] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = `${path}-${i}`
      paths.push(chunkPath)
      parts.push([chunkPath, chunks[i]])
    }
    parts.push([path, `${INDEX_PREFIX}${INDEX_DELIMITER}${paths.join(',')}`])

    forkJoin(_.map(parts, part => putChunk(part[0], part[1]))).subscribe({
      next(publicURLs) {
        subscriber.next(publicURLs[publicURLs.length - 1])
        subscriber.complete()
      },
      error(error) {
        subscriber.error(error)
      },
    })
  })
}

export function getAssembledChunks(
  path: string,
  getChunk: (path: string) => Observable<Buffer | string>,
) {
  return new Observable<Buffer>(subscriber => {
    getChunk(path).subscribe({
      next(index) {
        // when the index file is detected by its index prefix,
        // decompose the paths and fetch them individually
        if (
          (typeof index === 'string' &&
            index.substr(0, INDEX_PREFIX.length) === INDEX_PREFIX) ||
          (typeof index !== 'string' &&
            (index as Buffer).slice(0, PREFIX_BUFFER.length).equals(PREFIX_BUFFER))
        ) {
          const chunkPaths = index
            .toString()
            .split(INDEX_DELIMITER, 2)[1]
            .split(',')
          forkJoin(_.map(chunkPaths, path => getChunk(path))).subscribe({
            next(chunks) {
              subscriber.next(assemble(chunks))
              subscriber.complete()
            },
            error(error) {
              subscriber.error(error)
            },
          })

          return
        }

        // otherwise, it is the sole chunk this file is made of and we can return it
        subscriber.next(index as Buffer)
        subscriber.complete()
      },
      error(error) {
        subscriber.error(error)
      },
    })
  })
}

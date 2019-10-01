import { Buffer } from 'buffer'
import { DEFAULT_UPLOAD_FILE_CHUNK_SIZE } from 'constants/index'

export function assemble(buffers: Buffer[]): Buffer {
  return Buffer.concat(buffers)
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

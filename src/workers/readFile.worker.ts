async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reader.abort()
      reject('could not parse file')
    }

    reader.onload = () => {
      if (reader.result === null || typeof reader.result === 'string') {
        reject('File was parsed as null or string.')
      }

      resolve(reader.result as ArrayBuffer)
    }

    reader.readAsArrayBuffer(file)
  })
}

interface FileReaderResponse {
  arrayBuffer: ArrayBuffer
  objectURL: string
}

export async function readFile(file: File): Promise<FileReaderResponse> {
  const arrayBuffer = await readFileAsArrayBuffer(file)
  const blob = new Blob([arrayBuffer], { type: file.type })
  const objectURL = URL.createObjectURL(blob)

  return {
    arrayBuffer,
    objectURL,
  }
}

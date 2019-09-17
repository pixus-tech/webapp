import { Observable } from 'rxjs'

import { FileHandle, FileHandleWithData } from 'models/fileHandle'
import userSession from 'utils/userSession'
import { fileReader } from 'workers/index'

export function upload(path: string, payload: ArrayBuffer | string) {
  return new Observable<string>(subscriber => {
    userSession
      .putFile(path, payload as any) // TODO: I think blockstack uses wrong type `Buffer` here
      .then(url => {
        // TODO: maybe set gaiaURL for fileHandle here
        subscriber.next(url)
        subscriber.complete()
      })
      .catch(error => {
        subscriber.error(error)
      })
  })
}

export function read(fileHandle: FileHandle) {
  return new Observable<FileHandleWithData>(subscriber => {
    fileReader
      .readFile(fileHandle.file)
      .then(({ arrayBuffer, objectURL }) => {
        const fileHandleWithData: FileHandleWithData = {
          ...fileHandle,
          payload: arrayBuffer,
          objectURL,
        }

        subscriber.next(fileHandleWithData)
        subscriber.complete()
      })
      .catch(error => {
        subscriber.error(error)
      })
  })
}

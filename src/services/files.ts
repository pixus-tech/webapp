import { Observable } from 'rxjs'

import { FileHandle, FileHandleWithData } from 'models/fileHandle'
import userSession from 'utils/userSession'
import { fileReader } from 'workers/index'

export function upload(path: string, payload: ArrayBuffer | string) {
  return new Observable<string>(subscriber => {
    const username = userSession.loadUserData().username
    userSession
      .putFile(path, payload as any) // TODO: I think blockstack uses wrong type `Buffer` here
      .then(url => {
        subscriber.next(username)
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

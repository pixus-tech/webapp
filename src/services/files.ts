import { Buffer } from 'buffer'
import { Observable } from 'rxjs'

import { FileHandle, FileHandleWithData } from 'models/fileHandle'
import userSession from 'utils/userSession'
import { fileReader } from 'workers/index'

export function upload(
  path: string,
  payload: ArrayBuffer | string,
  key?: string,
) {
  return new Observable<string>(subscriber => {
    const username = userSession.loadUserData().username
    const uploadPayload =
      typeof payload === 'string' ? payload : Buffer.from(payload)
    userSession
      .putFile(path, uploadPayload, { encrypt: key || true })
      .then(url => {
        subscriber.next(username)
        subscriber.complete()
      })
      .catch(error => {
        subscriber.error(error)
      })
  })
}

export function download(path: string, username: string, key?: string) {
  return new Observable<ArrayBuffer | string>(subscriber => {
    userSession
      .getFile(path, { decrypt: key || true, username })
      .then(data => {
        subscriber.next(data)
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

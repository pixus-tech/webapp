import { Buffer } from 'buffer'

import { FileHandle, FileHandleWithData } from 'models/fileHandle'
import userSession from 'utils/userSession'
import { fileReader } from 'workers/index'
import BaseService from './baseService'
import { Queue } from './dispatcher'

class Files extends BaseService {
  download = (path: string, username: string, key?: string) =>
    this.dispatcher.performAsync<ArrayBuffer | string>(Queue.Download, function(
      resolve,
      reject,
    ) {
      userSession
        .getFile(path, { decrypt: key || true, username })
        .then(resolve)
        .catch(reject)
    })

  read = (fileHandle: FileHandle) =>
    this.dispatcher.performAsync<FileHandleWithData>(Queue.ReadFile, function(
      resolve,
      reject,
    ) {
      fileReader
        .readFile(fileHandle.file)
        .then(({ arrayBuffer, objectURL }) => {
          const fileHandleWithData: FileHandleWithData = {
            ...fileHandle,
            payload: arrayBuffer,
            objectURL,
          }

          resolve(fileHandleWithData)
        })
        .catch(reject)
    })

  upload = (path: string, payload: ArrayBuffer | string, key?: string) =>
    this.dispatcher.performAsync<string>(Queue.Upload, function(
      resolve,
      reject,
    ) {
      const username = userSession.loadUserData().username
      const uploadPayload =
        typeof payload === 'string' ? payload : Buffer.from(payload)
      userSession
        .putFile(path, uploadPayload, { encrypt: key || true })
        .then(_url => resolve(username))
        .catch(reject)
    })
}

export default new Files()

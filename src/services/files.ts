import { Buffer } from 'buffer'
import { Observable } from 'rxjs'

import { FileHandle, FileHandleWithData } from 'models/fileHandle'
import userSession from './userSession'
import { fileReader } from 'workers/index'
import BaseService from './baseService'
import { Queue } from './dispatcher'

import {
  getPublicKeyFromPrivate,
  UserSession,
  uploadToGaiaHub,
} from 'blockstack'
import { appConfig } from 'constants/blockstack'
import { chunk, getAssembledChunks, putChunks } from 'utils/fileChunker'

function encryptAndChunkPayload(
  payload: ArrayBuffer | string,
  publicKey: string,
) {
  const userSession = new UserSession({ appConfig })

  let buffer: Buffer
  if (typeof payload === 'string') {
    buffer = Buffer.from(payload, 'utf-8')
  } else {
    buffer = Buffer.from(payload)
  }

  const encryptedContent = Buffer.from(
    userSession.encryptContent(buffer, { publicKey }),
    'utf-8',
  )
  return chunk(encryptedContent)
}

class Files extends BaseService {
  private putFile = (path: string, payload: Buffer | string) => {
    return this.dispatcher.performAsync<string>(Queue.Upload, function(
      resolve,
      reject,
    ) {
      const contentType =
        typeof payload === 'string'
          ? 'application/json'
          : 'application/octet-stream'
      userSession
        .getOrSetLocalGaiaHubConnection()
        .then(hubConfig => {
          uploadToGaiaHub(path, payload, hubConfig, contentType)
            .then(resolve)
            .catch(() => {
              userSession
                .setLocalGaiaHubConnection()
                .then(freshHubConfig => {
                  uploadToGaiaHub(path, payload, freshHubConfig, contentType)
                    .then(resolve)
                    .catch(reject)
                })
                .catch(reject)
            })
        })
        .catch(reject)
    })
  }

  private getFile = (username: string) => (path: string) => {
    return this.dispatcher.performAsync<Buffer | string>(
      Queue.Download,
      function(resolve, reject) {
        return userSession
          .getFile(path, { decrypt: false, username })
          .then(result => {
            if (typeof result === 'string') {
              resolve(result)
            } else {
              resolve(Buffer.from(result))
            }
          })
          .catch(reject)
      },
    )
  }

  private ensurePublicKey = (publicKey?: string) => {
    if (!publicKey) {
      const privateKey = userSession.loadUserData().appPrivateKey
      return getPublicKeyFromPrivate(privateKey)
    }

    return publicKey
  }

  private ensurePrivateKey = (privateKey?: string) => {
    if (!privateKey) {
      return userSession.loadUserData().appPrivateKey
    }

    return privateKey
  }

  upload = (
    path: string,
    payload: ArrayBuffer | string,
    publicKey?: string,
  ) => {
    return new Observable<string>(subscriber => {
      const self = this
      this.dispatcher
        .performAsync<Buffer[]>(Queue.Encryption, resolve =>
          resolve(
            encryptAndChunkPayload(payload, this.ensurePublicKey(publicKey)),
          ),
        )
        .subscribe({
          next(chunks) {
            putChunks(path, chunks, self.putFile).subscribe({
              next(publicURL) {
                subscriber.next(publicURL)
                subscriber.complete()
              },
              error(error) {
                subscriber.error(error)
              },
            })
          },
          error(error) {
            subscriber.error(error)
          },
        })
    })
  }

  download = (path: string, username: string, privateKey?: string) => {
    return new Observable<Buffer | string>(subscriber => {
      const self = this
      getAssembledChunks(path, this.getFile(username)).subscribe({
        next(encryptedBuffer) {
          try {
            subscriber.next(
              userSession.decryptContent(encryptedBuffer.toString(), {
                privateKey: self.ensurePrivateKey(privateKey),
              }),
            )
            subscriber.complete()
          } catch (error) {
            subscriber.error(error)
          }
        },
        error(error) {
          subscriber.error(error)
        },
      })
    })
  }

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
}

export default new Files()

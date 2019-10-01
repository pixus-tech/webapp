import _ from 'lodash'
import { Buffer } from 'buffer'
import { Observable, forkJoin } from 'rxjs'

import { FileHandle, FileHandleWithData } from 'models/fileHandle'
import userSession from 'utils/userSession'
import { fileReader } from 'workers/index'
import BaseService from './baseService'
import { Queue } from './dispatcher'

import { UserSession, uploadToGaiaHub } from 'blockstack'
import { appConfig } from 'constants/blockstack'
import { assemble, chunk } from 'utils/fileChunker'

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

  private putFile = (path: string, payload: Buffer | string) => {
    return this.dispatcher.performAsync<string>(Queue.Upload, function(
      resolve,
      reject,
    ) {
      const contentType = 'application/json'
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

  upload = (path: string, payload: ArrayBuffer | string, publicKey: string) => {
    const self = this
    return new Observable<string>(subscriber => {
      const encryption = this.dispatcher.performAsync<Buffer[]>(
        Queue.Encryption,
        resolve => resolve(encryptAndChunkPayload(payload, publicKey)),
      )

      encryption.subscribe({
        next(chunks) {
          // Upload unchunked payload directly
          if (chunks.length === 1) {
            self.putFile(path, chunks[0]).subscribe({
              next(publicURL) {
                subscriber.next(publicURL)
                subscriber.complete()
              },
              error(error) {
                subscriber.error(error)
              },
            })
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
          parts.push([path, paths.join(',')])

          forkJoin(
            _.map(parts, part => self.putFile(part[0], part[1])),
          ).subscribe({
            next(publicURLs) {
              subscriber.next(publicURLs[publicURLs.length - 1])
              subscriber.complete()
            },
            error(error) {
              subscriber.error(error)
            },
          })
        },
      })
    })
  }
}

export default new Files()

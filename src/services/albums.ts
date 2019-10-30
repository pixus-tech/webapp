import { Observable } from 'rxjs'
import AlbumRecord, { AlbumRecordFactory } from 'db/radiks/album'
import Album, {
  parseAlbumRecord,
  parseAlbumRecords,
  UnsavedAlbum,
} from 'models/album'
import AlbumMeta, { defaultAlbumMeta } from 'models/albumMeta'
import {
  createUserGroup,
  currentUser,
  currentUsername,
  joinUserGroup,
} from 'utils/blockstack'

import BaseService from './baseService'
import db from './db'
import { Queue } from './dispatcher'
import records from './records'
import {
  DEFAULT_ALBUM_NAME,
  DEFAULT_ALBUM_DIRECTORY_NAME,
} from 'constants/index'

type StreamCallback = (record: AlbumRecord) => void

class Albums extends BaseService {
  private streamCallback: StreamCallback | undefined = undefined

  addAlbum = (isDirectory: boolean) =>
    this.dispatcher.performAsync<Album>(
      Queue.RecordOperation,
      (resolve, reject) => {
        const user = currentUser()

        const unsavedAlbum: UnsavedAlbum = {
          isDirectory,
          name: isDirectory ? DEFAULT_ALBUM_DIRECTORY_NAME : DEFAULT_ALBUM_NAME,
          users: [user.attrs.username],
          meta: defaultAlbumMeta,
        }

        createUserGroup(AlbumRecordFactory.build, unsavedAlbum)
          .then(albumRecord => {
            const album: Album = {
              ...parseAlbumRecord(albumRecord),
              meta: unsavedAlbum.meta,
            }
            db.albums.add(album)
            resolve(album)
          })
          .catch(reject)
      },
    )

  refreshAlbums = () =>
    this.dispatcher.performAsync<undefined>(
      Queue.RecordOperation,
      (resolve, reject) => {
        AlbumRecord.fetchList<AlbumRecord>({ users: currentUsername() })
          .then(albumRecords => {
            const albums = parseAlbumRecords(albumRecords, { origin: 'radiks' })
            db.albums
              .updateAll(albums)
              .then(() => {
                resolve(undefined)
              })
              .catch(reject)
          })
          .catch(reject)
      },
    )

  getAlbumsFromCache = () =>
    this.dispatcher.performAsync<Album[]>(
      Queue.RecordOperation,
      (resolve, reject) => {
        db.albums
          .all()
          .then(resolve)
          .catch(reject)
      },
    )

  saveToRadiks = (album: Album) => {
    const albumRecord = AlbumRecordFactory.build(album)
    const self = this

    return new Observable<AlbumRecord>(subscriber => {
      if (!album.meta.isOnRadiks) {
        joinUserGroup(albumRecord)
          .then(() => {
            records.save(albumRecord).subscribe({
              next() {
                self.updateMeta(album, { isOnRadiks: 1, isDirty: 0 })
                subscriber.next(albumRecord)
                subscriber.complete()
              },
              error(error) {
                subscriber.error(error)
              },
            })
          })
          .catch(subscriber.error)
      } else {
        records.save(albumRecord).subscribe({
          next() {
            self.updateMeta(album, { isDirty: 0 })
            subscriber.next(albumRecord)
            subscriber.complete()
          },
          error(error) {
            subscriber.error(error)
          },
        })
      }
    })
  }

  update = (album: Album, updates: Partial<Album>) =>
    this.dispatcher.performAsync<Album>(
      Queue.RecordOperation,
      (resolve, reject) => {
        const updatedAlbum = { ...album, ...updates }
        updatedAlbum.meta = { ...updatedAlbum.meta, isDirty: 1 }

        db.albums
          .update(updatedAlbum)
          .then(() => resolve(updatedAlbum))
          .catch(reject)
      },
    )

  updateMeta = (album: Album, meta: Partial<AlbumMeta>) =>
    this.dispatcher.performAsync<Album>(
      Queue.RecordOperation,
      (resolve, reject) => {
        const updatedMeta: AlbumMeta = { ...album.meta, isDirty: 1, ...meta }
        const updatedAlbum: Album = {
          ...album,
          meta: updatedMeta,
        }
        db.albums
          .update(updatedAlbum)
          .then(() => resolve(updatedAlbum))
          .catch(reject)
      },
    )
}

export default new Albums()

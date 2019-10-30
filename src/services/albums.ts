import AlbumRecord, { AlbumRecordFactory } from 'db/radiks/album'
import Album, {
  buildAlbumRecord,
  parseAlbumRecord,
  parseAlbumRecords,
  UnsavedAlbum,
} from 'models/album'
import AlbumMeta, { defaultAlbumMeta } from 'models/albumMeta'
import { createUserGroup, currentUser, currentUsername } from 'utils/blockstack'

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
    this.dispatcher.performAsync<{ resource: Album }>(
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
            resolve({ resource: album })
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
            const albums = parseAlbumRecords(albumRecords)
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

  save = (album: Album | UnsavedAlbum) => {
    const albumRecord = AlbumRecordFactory.build(album)
    // TODO: The db update should be returned here because it is more likely to succeed
    // the album should then have a flag dirty and sync to radiks if the client is online
    db.albums.update(album)
    return records.save(albumRecord)
  }

  updateAlbum = (album: Album, updates: Partial<Album>) =>
    this.dispatcher.performAsync<{ resource: Album }>(
      Queue.RecordOperation,
      (resolve, reject) => {
        const albumRecord = buildAlbumRecord(album)
        // TODO: The db update should be returned here because it is more likely to succeed
        // the album should then have a flag dirty and sync to radiks if the client is online
        const updatedAlbum = { ...album, ...updates }
        db.albums.update(updatedAlbum)
        albumRecord.update(updates)
        records.save(albumRecord).subscribe({
          next() {
            resolve({ resource: updatedAlbum })
          },
          error(error) {
            reject(error)
          },
        })
      },
    )

  updateMeta = (album: Album, meta: Partial<AlbumMeta>) =>
    this.dispatcher.performAsync<{ resource: Album }>(
      Queue.RecordOperation,
      (resolve, reject) => {
        const updatedMeta: AlbumMeta = { ...album.meta, ...meta }
        const updatedAlbum: Album = {
          ...album,
          meta: updatedMeta,
        }
        db.albums
          .update(updatedAlbum)
          .then(() => {
            resolve({ resource: updatedAlbum })
          })
          .catch(reject)
      },
    )
}

export default new Albums()

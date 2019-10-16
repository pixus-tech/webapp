import AlbumRecord, { AlbumRecordFactory } from 'db/album'
import Album, {
  AlbumMeta,
  buildAlbumRecord,
  defaultAlbumMeta,
  parseAlbumRecord,
  parseAlbumRecords,
  UnsavedAlbum,
} from 'models/album'
import { createUserGroup, currentUser, currentUsername } from 'utils/blockstack'

import BaseService from './baseService'
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
      function(resolve, reject) {
        const user = currentUser()

        const album: UnsavedAlbum = {
          isDirectory,
          name: isDirectory ? DEFAULT_ALBUM_DIRECTORY_NAME : DEFAULT_ALBUM_NAME,
          users: [user.attrs.username],
          meta: defaultAlbumMeta,
        }

        createUserGroup(AlbumRecordFactory.build, album)
          .then(albumRecord => {
            resolve({ resource: parseAlbumRecord(albumRecord) })
          })
          .catch(reject)
      },
    )

  getAlbums = () =>
    this.dispatcher.performAsync<Album[]>(Queue.RecordOperation, function(
      resolve,
      reject,
    ) {
      AlbumRecord.fetchList<AlbumRecord>({ users: currentUsername() })
        .then(albumRecords => {
          resolve(parseAlbumRecords(albumRecords))
        })
        .catch(reject)
    })

  save = (album: Album | UnsavedAlbum) => {
    const albumRecord = AlbumRecordFactory.build(album)
    return records.save(albumRecord)
  }

  updateAlbum = (album: Album, updates: Partial<Album>) =>
    this.dispatcher.performAsync<{ resource: Album }>(
      Queue.RecordOperation,
      function(resolve, reject) {
        const albumRecord = buildAlbumRecord(album)
        albumRecord.update(updates)
        records.save(albumRecord).subscribe({
          next() {
            resolve({ resource: parseAlbumRecord(albumRecord) })
          },
          error(error) {
            reject(error)
          },
        })
      },
    )

  updateAlbumMeta = (album: Album, meta: Partial<AlbumMeta>) =>
    this.dispatcher.performAsync<{ resource: Album }>(
      Queue.RecordOperation,
      function(resolve, reject) {
        // TODO: implement set meta -> parent id
        resolve({ resource: { ...album, meta: { ...album.meta, ...meta } } })
      },
    )
}

export default new Albums()

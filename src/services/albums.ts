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
          // const index = this.db.albums.all()
          const index: { [id: string]: AlbumMeta } = {}
          const albums = parseAlbumRecords(albumRecords).map(album =>
            Object.assign(album, { meta: index[album._id] || album.meta }),
          )
          resolve(albums)
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

  updateMeta = (album: Album, meta: Partial<AlbumMeta>) =>
    this.dispatcher.performAsync<{ resource: Album }>(
      Queue.RecordOperation,
      function(resolve, reject) {
        const updatedAlbum: Album = {
          ...album,
          meta: { ...album.meta, ...meta },
        }
        // this.db.albums.set(album._id, updatedAlbum.meta)
        // AlbumMetaRecord.set(album._id, updatedAlbum.meta)
        // TODO: implement set meta -> parent id
        resolve({ resource: updatedAlbum })
      },
    )
}

export default new Albums()

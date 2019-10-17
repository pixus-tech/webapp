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
import { getAlbums } from 'store/albums/actions'

type StreamCallback = (record: AlbumRecord) => void

class Albums extends BaseService {
  private streamCallback: StreamCallback | undefined = undefined

  addAlbum = (isDirectory: boolean) =>
    this.dispatcher.performAsync<{ resource: Album }>(
      Queue.RecordOperation,
      (resolve, reject) => {
        const user = currentUser()

        const album: UnsavedAlbum = {
          isDirectory,
          name: isDirectory ? DEFAULT_ALBUM_DIRECTORY_NAME : DEFAULT_ALBUM_NAME,
          users: [user.attrs.username],
          meta: defaultAlbumMeta,
        }

        createUserGroup(AlbumRecordFactory.build, album)
          .then(albumRecord => {
            const album = parseAlbumRecord(albumRecord)
            this.db.albums.add(album)
            this.db.albumMetas.add(album._id, album.meta)
            resolve({ resource: album })
          })
          .catch(reject)
      },
    )

  refreshAlbums = () =>
    this.dispatcher.performAsync<Album[]>(
      Queue.RecordOperation,
      (resolve, reject) => {
        AlbumRecord.fetchList<AlbumRecord>({ users: currentUsername() })
          .then(albumRecords => {
            const albums = parseAlbumRecords(albumRecords)
            this.db.albums
              .updateAll(albums)
              .then(() => {
                this.dispatch(getAlbums.request())
                resolve(albums)
              })
              .catch(reject)
          })
          .catch(reject)
      },
    )

  getAlbums = () =>
    this.dispatcher.performAsync<Album[]>(
      Queue.RecordOperation,
      (resolve, reject) => {
        this.db.albums
          .all()
          .then(resolve)
          .catch(reject)
      },
    )

  save = (album: Album | UnsavedAlbum) => {
    const albumRecord = AlbumRecordFactory.build(album)
    // TODO: The db update should be returned here because it is more likely to succeed
    // the album should then have a flag dirty and sync to radiks if the client is online
    this.db.albums.update(parseAlbumRecord(albumRecord))
    return records.save(albumRecord)
  }

  updateAlbum = (album: Album, updates: Partial<Album>) =>
    this.dispatcher.performAsync<{ resource: Album }>(
      Queue.RecordOperation,
      (resolve, reject) => {
        const albumRecord = buildAlbumRecord(album)
        // TODO: The db update should be returned here because it is more likely to succeed
        // the album should then have a flag dirty and sync to radiks if the client is online
        this.db.albums.update({ ...album, ...updates })
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
      (resolve, reject) => {
        const updatedMeta: AlbumMeta = { ...album.meta, ...meta }
        const updatedAlbum: Album = {
          ...album,
          meta: updatedMeta,
        }
        this.db.albumMetas
          .update(album._id, updatedMeta)
          .then(() => {
            resolve({ resource: updatedAlbum })
          })
          .catch(reject)
      },
    )
}

export default new Albums()

import AlbumRecord, { AlbumRecordFactory } from 'db/album'
import Album, {
  buildAlbumRecord,
  parseAlbumRecord,
  parseAlbumRecords,
  UnsavedAlbum,
} from 'models/album'
import { createUserGroup, currentUser, currentUsername } from 'utils/blockstack'

import BaseService from './baseService'
import { Queue } from './dispatcher'
import records from './records'

type StreamCallback = (record: AlbumRecord) => void

class Albums extends BaseService {
  private streamCallback: StreamCallback | undefined = undefined

  addAlbum = (name: string) =>
    this.dispatcher.performAsync<{ resource: Album }>(
      Queue.RecordOperation,
      function(resolve, reject) {
        const user = currentUser()

        const album: UnsavedAlbum = {
          index: 0,
          name,
          users: [user.attrs.username],
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
}

export default new Albums()

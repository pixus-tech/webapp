import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import AlbumRecord, { AlbumRecordFactory } from 'db/album'
import Album, {
  buildAlbumRecord,
  parseAlbumRecord,
  parseAlbumRecords,
  UnsavedAlbum,
} from 'models/album'
import { createUserGroup, currentUser, currentUserName } from 'utils/blockstack'

export const getAlbumTree = () => {
  return new Observable<Album[]>(subscriber => {
    AlbumRecord.fetchList<AlbumRecord>({ users: currentUserName() })
      .then(albumRecords => {
        subscriber.next(parseAlbumRecords(albumRecords))
        subscriber.complete()
      })
      .catch(error => subscriber.error(error))
  })
}

export const addAlbum = (name: string) => {
  const user = currentUser()

  const album: UnsavedAlbum = {
    index: 0,
    name,
    users: [user.attrs.username],
  }

  return new Observable<{ resource: Album }>(subscriber => {
    createUserGroup(AlbumRecordFactory.build, album)
      .then(albumRecord => {
        console.log(albumRecord)
        subscriber.next({ resource: parseAlbumRecord(albumRecord) })
        subscriber.complete()
      })
      .catch(error => subscriber.error(error))
  })
}

export const updateAlbum = (album: Album, updates: Partial<Album>) => {
  const albumRecord = buildAlbumRecord(album)
  return from(albumRecord.save()).pipe(
    map(response => {
      return { resource: parseAlbumRecord(albumRecord) }
    }),
  )
}

type StreamCallback = (record: AlbumRecord) => void

let streamCallback: StreamCallback | undefined = undefined

export const unsubscribe = () => {
  AlbumRecord.removeStreamListener(streamCallback as any) // TODO: Wrong type in radiks
  streamCallback = undefined

  return new Observable<undefined>(subscriber => {
    subscriber.complete()
  })
}

export const subscribe = () => {
  if (streamCallback) {
    unsubscribe()
  }

  return new Observable<Album>(subscriber => {
    streamCallback = function streamCallback(record: AlbumRecord) {
      const album = parseAlbumRecord(record)

      if (album === null) {
        return
      }

      subscriber.next(album)
    }

    AlbumRecord.addStreamListener(streamCallback as any) // TODO: Wrong type in radiks
  })
}

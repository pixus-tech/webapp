import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import AlbumRecord from 'db/album'
import Album, {
  buildAlbumRecord,
  parseAlbumRecord,
  parseAlbumRecords,
} from 'models/album'

import { isModelOwnedByUser } from 'models/blockstack'

export const getAlbumTree = () => {
  //const url = `${config.apiUrl}/foo/bar?page=${filter.page}&size=${filter.perPage}`
  return from(AlbumRecord.fetchOwnList<AlbumRecord>()).pipe(
    map((albumRecords: AlbumRecord[]) => {
      return parseAlbumRecords(albumRecords)
    }),
    // TODO: fail e.g. on decrypt failure
  )
}

export const addAlbum = (name: string) => {
  const albumRecord = buildAlbumRecord({
    isOpen: false,
    index: 0,
    name,
  })

  return from(albumRecord.save()).pipe(
    map(response => {
      console.log('Is the error here?', parseAlbumRecord(albumRecord))
      return { resource: parseAlbumRecord(albumRecord) }
    }),
  )
}

export const updateAlbum = (album: Album, updates: Partial<Album>) => {
  const albumRecord = buildAlbumRecord(album)
  albumRecord.update(updates)
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
      if (!isModelOwnedByUser(record)) return
      const album = parseAlbumRecord(record)
      subscriber.next(album)
    }

    AlbumRecord.addStreamListener(streamCallback as any) // TODO: Wrong type in radiks
  })
}

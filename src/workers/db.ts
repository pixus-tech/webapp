// eslint-disable-next-line
import DBWorker from 'worker-loader!workers/db.worker'
import { registerWorker, postJob } from './'

import { Buffer } from 'buffer'
import Album from 'models/album'
import AlbumMeta from 'models/albumMeta'

const dbWorker = new DBWorker()
registerWorker(dbWorker)

// --- Albums

export function serializeAlbums() {
  return postJob<string>(dbWorker, 'albums.serialize')
}

export function deserializeAlbums(payload: string | Buffer) {
  return postJob<boolean>(dbWorker, 'albums.deserialize', { payload })
}

export function addAlbum(album: Album) {
  return postJob<boolean>(dbWorker, 'albums.add', { payload: album })
}

export function allAlbums() {
  return postJob<Album[]>(dbWorker, 'albums.all')
}

export function updateAlbum(album: Album) {
  return postJob<boolean>(dbWorker, 'albums.update', { payload: album })
}

export function updateAlbums(albums: Album[]) {
  return postJob<boolean>(dbWorker, 'albums.updateAll', { payload: albums })
}

// --- AlbumMetas

export function serializeAlbumMetas() {
  return postJob<string>(dbWorker, 'albumMetas.serialize')
}

export function deserializeAlbumMetas(payload: string | Buffer) {
  return postJob<boolean>(dbWorker, 'albumMetas.deserialize', { payload })
}

export function addAlbumMeta(albumId: string, albumMeta: AlbumMeta) {
  return postJob<boolean>(dbWorker, 'albumMetas.add', {
    payload: { albumId, albumMeta },
  })
}

export function updateAlbumMeta(albumId: string, albumMeta: AlbumMeta) {
  return postJob<boolean>(dbWorker, 'albumMetas.update', {
    payload: { albumId, albumMeta },
  })
}

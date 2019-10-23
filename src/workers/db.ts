// eslint-disable-next-line
import DBWorker from 'worker-loader!workers/db.worker'
import { registerWorker, postJob } from './'

import { Buffer } from 'buffer'
import Album from 'models/album'
import { defaultAlbumMeta } from 'models/albumMeta'
import Image, { QueryableImageAttributes } from 'models/image'
import { defaultImageMeta } from 'models/imageMeta'

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

export function updateAlbum(album: Partial<Album>) {
  return postJob<boolean>(dbWorker, 'albums.update', {
    payload: { album, defaultMeta: defaultAlbumMeta },
  })
}

export function updateAlbums(albums: Partial<Album>[]) {
  return postJob<boolean>(dbWorker, 'albums.updateAll', {
    payload: { albums, defaultMeta: defaultAlbumMeta },
  })
}

// --- Images

export function serializeImages() {
  return postJob<string>(dbWorker, 'images.serialize')
}

export function deserializeImages(payload: string | Buffer) {
  return postJob<boolean>(dbWorker, 'images.deserialize', { payload })
}

export function addImage(image: Image) {
  return postJob<boolean>(dbWorker, 'images.add', { payload: image })
}

export function destroyImage(image: Image) {
  return postJob<boolean>(dbWorker, 'images.destroy', { payload: image })
}

export function filteredImages(filter: QueryableImageAttributes) {
  return postJob<Image[]>(dbWorker, 'images.where', { payload: filter })
}

export function updateImage(image: Partial<Image>) {
  return postJob<boolean>(dbWorker, 'images.update', {
    payload: { image, defaultMeta: defaultImageMeta },
  })
}

export function updateImages(images: Partial<Image>[]) {
  return postJob<boolean>(dbWorker, 'images.updateAll', {
    payload: { images, defaultMeta: defaultImageMeta },
  })
}

import { Observable } from 'rxjs'

import { ALBUMS_FILE_PATH, IMAGES_FILE_PATH } from 'constants/index'
import Album from 'models/album'
import Image, { ImageFilterAttributes } from 'models/image'
import { dbWorker } from 'workers'

type UploadFunction = (
  path: string,
  payload: ArrayBuffer | string,
  publicKey?: string,
) => Observable<string>
type DownloadFunction = (
  path: string,
  username?: string,
  privateKey?: string,
) => Observable<string | Buffer>

class DB {
  albums = {
    add: function(album: Album) {
      return dbWorker.addAlbum(album)
    },
    all: function() {
      return dbWorker.allAlbums()
    },
    update: function(album: Partial<Album>) {
      return dbWorker.updateAlbum(album)
    },
    updateAll: function(albums: Partial<Album>[]) {
      return dbWorker.updateAlbums(albums)
    },
    save: (upload: UploadFunction) => {
      return this.save(
        dbWorker.serializeAlbums,
        upload.bind(undefined, ALBUMS_FILE_PATH),
      )
    },
    load: (download: DownloadFunction) => {
      return this.load(
        dbWorker.deserializeAlbums,
        download.bind(undefined, ALBUMS_FILE_PATH),
      )
    },
  }

  images = {
    add: function(image: Image) {
      return dbWorker.addImage(image)
    },
    destroy: function(image: Image) {
      return dbWorker.destroyImage(image)
    },
    where: function(filter: ImageFilterAttributes) {
      return dbWorker.filteredImages(filter)
    },
    update: function(image: Partial<Image>) {
      return dbWorker.updateImage(image)
    },
    updateAll: function(images: Partial<Image>[]) {
      return dbWorker.updateImages(images)
    },
    save: (upload: UploadFunction) => {
      return this.save(
        dbWorker.serializeImages,
        upload.bind(undefined, IMAGES_FILE_PATH),
      )
    },
    load: (download: DownloadFunction) => {
      return this.load(
        dbWorker.deserializeImages,
        download.bind(undefined, IMAGES_FILE_PATH),
      )
    },
  }

  save = (
    serialize: () => Promise<string>,
    upload: (payload: string) => Observable<string>,
  ) =>
    new Promise<undefined>((resolve, reject) => {
      serialize()
        .then(json => {
          upload(json).subscribe({
            next() {
              resolve()
            },
            error(error) {
              reject(error)
            },
          })
        })
        .catch(reject)
    })

  load = (
    deserialize: (json: string | Buffer) => Promise<boolean>,
    download: () => Observable<string | Buffer>,
  ) =>
    new Promise<boolean>((resolve, reject) => {
      download().subscribe({
        next(content) {
          deserialize(
            typeof content === 'string' ? content : content.toString(),
          )
            .then(resolve)
            .catch(reject)
        },
        error(error) {
          reject(error)
        },
      })
    })
}

export default new DB()

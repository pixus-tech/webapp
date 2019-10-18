import { Observable } from 'rxjs'

import { ALBUMS_FILE_PATH, ALBUM_METAS_FILE_PATH } from 'constants/index'
import Album from 'models/album'
import AlbumMeta from 'models/albumMeta'
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
    update: function(album: Album) {
      return dbWorker.updateAlbum(album)
    },
    updateAll: function(albums: Album[]) {
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

  albumMetas = {
    add: function(albumId: string, albumMeta: AlbumMeta) {
      return dbWorker.addAlbumMeta(albumId, albumMeta)
    },
    update: function(albumId: string, albumMeta: AlbumMeta) {
      return dbWorker.updateAlbumMeta(albumId, albumMeta)
    },
    save: (upload: UploadFunction) => {
      return this.save(
        dbWorker.serializeAlbumMetas,
        upload.bind(undefined, ALBUM_METAS_FILE_PATH),
      )
    },
    load: (download: DownloadFunction) => {
      return this.load(
        dbWorker.deserializeAlbumMetas,
        download.bind(undefined, ALBUM_METAS_FILE_PATH),
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

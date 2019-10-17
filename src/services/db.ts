import Album from 'models/album'
import AlbumMeta from 'models/albumMeta'
import { dbWorker } from 'workers'

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
  }

  albumMetas = {
    add: function(albumId: string, albumMeta: AlbumMeta) {
      return dbWorker.addAlbumMeta(albumId, albumMeta)
    },
    update: function(albumId: string, albumMeta: AlbumMeta) {
      return dbWorker.updateAlbumMeta(albumId, albumMeta)
    },
  }
}

export default new DB()

import BaseRecord from './index'

export default class AlbumRecord extends BaseRecord {
  static className = 'Album'
  static schema = {
    index: Number,
    isOpen: Boolean,
    parentAlbumId: {
      type: String,
      decrypted: true,
    },
    name: String,
  }

  /* public images: Image[] = []

   * async afterFetch() {
   *   this.images = await Image.fetchList({
   *     albumId: this._id,
   *   })
   * } */
}

import { Model } from 'radiks'
import { slugify } from 'utils'

export default class AlbumRecord extends Model {
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

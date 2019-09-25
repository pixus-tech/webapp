import _ from 'lodash'
import uuid from 'uuid/v4'

import BaseRecord from './index'
import Album, { UnsavedAlbum } from 'models/album'

export default class AlbumRecord extends BaseRecord {
  static className = 'Album'
  static schema = {
    index: Number,
    name: String,
    parentAlbumId: {
      type: String,
      decrypted: true,
    },
    userGroupId: {
      type: String,
      decrypted: true,
    },
  }
}

export class AlbumRecordFactory {
  static build(album: UnsavedAlbum | Album): AlbumRecord {
    return new AlbumRecord({
      _id: _.get(album, '_id', uuid()),
      index: album.index,
      name: album.name,
      parentAlbumId: album.parentAlbumId,
      userGroupId: album.userGroupId,
    })
  }
}

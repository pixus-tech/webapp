import _ from 'lodash'
import { Attrs, UserGroup } from 'radiks'
import uuid from 'uuid/v4'

import Album, { UnsavedAlbum } from 'models/album'
import AsyncCrypto from './concerns/crypto'

export default class AlbumRecord extends UserGroup {
  static className = 'UserGroup'
  static schema = {
    ...UserGroup.schema,
    index: Number,
    name: String,
    parentAlbumId: {
      type: String,
      decrypted: true,
    },
    users: {
      type: Array,
      decrypted: true,
    },
  }

  async encrypted(): Promise<Attrs> {
    return await AsyncCrypto.encrypt(this)
  }

  async decrypt() {
    return await AsyncCrypto.decrypt(this)
  }
}

export class AlbumRecordFactory {
  static build(album: UnsavedAlbum | Album): AlbumRecord {
    const record = new AlbumRecord({
      _id: _.get(album, '_id', uuid()),
      index: album.index,
      name: album.name,
      parentAlbumId: album.parentAlbumId,
      privateKey: album.privateKey,
      signingKeyId: album.signingKeyId,
      users: album.users,
    })
    record.privateKey = album.privateKey
    return record
  }
}

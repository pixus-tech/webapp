import * as _ from 'lodash'
import * as Yup from 'yup'

import BaseModel, {
  UnsavedModel,
  ModelParseOptions,
  defaultModelParseOptions,
} from './'
import AlbumMeta from './albumMeta'
import AlbumRecord, { AlbumRecordFactory } from 'db/radiks/album'

export default interface Album extends BaseModel {
  isDirectory: boolean
  name: string
  privateKey?: string
  publicKey?: string
  signingKeyId?: string
  users: string[]

  // Fields that are stored separately from radiks
  meta: AlbumMeta
}

export type UnsavedAlbum = UnsavedModel<Album>
export interface RemoteAlbum extends Omit<Album, 'meta'> {
  meta: Partial<AlbumMeta>
}

export function buildAlbumRecord(album: UnsavedAlbum | Album): AlbumRecord {
  return AlbumRecordFactory.build(album)
}

export function parseAlbumRecord(
  record: AlbumRecord,
  options: ModelParseOptions = defaultModelParseOptions,
): RemoteAlbum {
  const privateKey = record.encryptionPrivateKey()
  record.privateKey = privateKey
  const publicKey = record.publicKey()
  let meta: Partial<AlbumMeta> = {}
  if (options.origin === 'radiks') {
    meta = {
      isOnRadiks: 1,
    }
  }

  return {
    _id: record._id,
    isDirectory: record.attrs.isDirectory,
    meta,
    name: record.attrs.name,
    privateKey,
    publicKey,
    signingKeyId: record.attrs.signingKeyId,
    users: record.attrs.users,
  }
}

export function parseAlbumRecords(
  records: AlbumRecord[],
  options: ModelParseOptions = defaultModelParseOptions,
): RemoteAlbum[] {
  return _.map(records, r => parseAlbumRecord(r, options))
}

export const validationSchema = Yup.object().shape({
  name: Yup.string().required('Is Required'),
})

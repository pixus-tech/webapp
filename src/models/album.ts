import * as _ from 'lodash'
import * as Yup from 'yup'

import BaseModel, { UnsavedModel } from './'
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
export type RemoteAlbum = Omit<Album, 'meta'>

export function buildAlbumRecord(album: UnsavedAlbum | Album): AlbumRecord {
  return AlbumRecordFactory.build(album)
}

export function parseAlbumRecord(record: AlbumRecord): RemoteAlbum {
  const privateKey = record.encryptionPrivateKey()
  record.privateKey = privateKey
  const publicKey = record.publicKey()

  return {
    _id: record._id,
    isDirectory: record.attrs.isDirectory,
    name: record.attrs.name,
    privateKey,
    publicKey,
    signingKeyId: record.attrs.signingKeyId,
    users: record.attrs.users,
  }
}

export function parseAlbumRecords(records: AlbumRecord[]): RemoteAlbum[] {
  return _.map(records, parseAlbumRecord)
}

export const validationSchema = Yup.object().shape({
  name: Yup.string().required('Is Required'),
})

import * as _ from 'lodash'
import * as Yup from 'yup'

import BaseModel, { UnsavedModel } from './'
import AlbumRecord, { AlbumRecordFactory } from 'db/album'

export default interface Album extends BaseModel {
  index: number
  name: string
  parentAlbumId?: string
  privateKey?: string
  publicKey?: string
  signingKeyId?: string
  users: string[]
}

export type UnsavedAlbum = UnsavedModel<Album>

export function buildAlbumRecord(album: UnsavedAlbum | Album): AlbumRecord {
  return AlbumRecordFactory.build(album)
}

export function parseAlbumRecord(record: AlbumRecord): Album {
  const privateKey = record.encryptionPrivateKey()
  record.privateKey = privateKey
  const publicKey = record.publicKey()

  return {
    _id: record._id,
    index: record.attrs.index,
    name: record.attrs.name,
    parentAlbumId: record.attrs.parentAlbumId,
    privateKey,
    publicKey,
    signingKeyId: record.attrs.signingKeyId,
    users: record.attrs.users,
  }
}

export function parseAlbumRecords(records: AlbumRecord[]): Album[] {
  return _.compact(_.map(records, parseAlbumRecord))
}

export const validationSchema = Yup.object().shape({
  name: Yup.string().required('Is Required'),
})

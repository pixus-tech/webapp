import * as _ from 'lodash'
import * as Yup from 'yup'

import BaseModel, { UnsavedModel } from './'
import AlbumRecord, { AlbumRecordFactory } from 'db/album'

export interface AlbumMeta {
  index: number
  parentId?: string
}

export const defaultAlbumMeta: AlbumMeta = {
  index: Number.MAX_SAFE_INTEGER,
  parentId: undefined,
}

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

export function buildAlbumRecord(album: UnsavedAlbum | Album): AlbumRecord {
  return AlbumRecordFactory.build(album)
}

export function parseAlbumRecord(record: AlbumRecord): Album {
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
    meta: defaultAlbumMeta,
  }
}

export function parseAlbumRecords(records: AlbumRecord[]): Album[] {
  return _.compact(_.map(records, parseAlbumRecord))
}

export const validationSchema = Yup.object().shape({
  name: Yup.string().required('Is Required'),
})

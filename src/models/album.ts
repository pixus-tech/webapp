import { UserGroup } from 'radiks'
import * as _ from 'lodash'
import * as Yup from 'yup'

import BaseModel, { UnsavedModel } from './'
import AlbumRecord from 'db/album'

export default interface Album extends BaseModel {
  index: number
  name: string
  parentAlbumId?: string
  userGroupId: string
  userGroup?: UserGroup
}

export type UnsavedAlbum = UnsavedModel<Album>

export function buildAlbumRecord(album: UnsavedAlbum | Album): AlbumRecord {
  return new AlbumRecord(album)
}

export function parseAlbumRecord(record: AlbumRecord): Album | null {
  if (!record.isOwnedByUser()) {
    return null
  }

  return {
    _id: record._id,
    index: record.attrs.index,
    name: record.attrs.name,
    parentAlbumId: record.attrs.parentAlbumId,
    userGroupId: record.attrs.userGroupId,
  }
}

export function parseAlbumRecords(records: AlbumRecord[]): Album[] {
  return _.compact(_.map(records, parseAlbumRecord))
}

export const validationSchema = Yup.object().shape({
  name: Yup.string().required('Is Required'),
})

import * as _ from 'lodash'

import BaseModel, { UnsavedModel } from './'
import AlbumRecord from 'db/album'

export default interface Album extends BaseModel {
  parentAlbumId?: string
  isOpen: boolean
  index: number
  name: string
}

type UnsavedAlbum = UnsavedModel<Album>

export function buildAlbumRecord(album: UnsavedAlbum | Album): AlbumRecord {
  return new AlbumRecord(album)
}

export function parseAlbumRecord(record: AlbumRecord): Album {
  return {
    _id: record._id,
    parentAlbumId: record.attrs.parentAlbumId,
    isOpen: record.attrs.isOpen,
    index: record.attrs.index,
    name: record.attrs.name,
  }
}

export function parseAlbumRecords(records: AlbumRecord[]): Album[] {
  return _.map(records, parseAlbumRecord)
}

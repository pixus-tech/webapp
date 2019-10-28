import BaseModel from './'
import { EXIFTags } from 'utils/exif'

export interface FileHandle extends BaseModel {
  file: File
  type: string
}

export interface FileHandleWithData extends FileHandle {
  exifTags?: EXIFTags
  objectURL: string
  payload: ArrayBuffer
}

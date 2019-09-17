import BaseModel from './'

export interface FileHandle extends BaseModel {
  file: File
  type: string
}

export interface FileHandleWithData extends FileHandle {
  objectURL: string
  payload: ArrayBuffer
}

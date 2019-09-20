export interface UploadData {
  id: string
  path: string
  payload: ArrayBuffer | string
}

export interface UploadSuccessData extends UploadData {
  uploader: string
}

export interface DownloadData {
  path: string
  fileContent: ArrayBuffer | string
}

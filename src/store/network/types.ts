export interface UploadData {
  id: string
  path: string
  payload: ArrayBuffer | string
  key?: string
}

export interface UploadSuccessData extends UploadData {
  uploader: string
}

export interface DownloadData {
  key?: string
  path: string
  username: string
}

export interface DownloadSuccessData extends DownloadData {
  fileContent: ArrayBuffer | string
}

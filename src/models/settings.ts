import { Buffer } from 'buffer'
import * as Yup from 'yup'

import {
  DEFAULT_CONCURRENT_DOWNLOADS_LIMIT,
  DEFAULT_CONCURRENT_ENCRYPTION_LIMIT,
  DEFAULT_CONCURRENT_FILE_READS_LIMIT,
  DEFAULT_CONCURRENT_UPLOADS_LIMIT,
  DEFAULT_UPLOAD_FILE_CHUNK_SIZE,
} from 'constants/index'

export default interface Settings {
  cryptoConcurrency: number
  downloadConcurrency: number
  fileConcurrency: number
  bytesPerFileChunk: number
  optOutAnalytics: boolean
  uploadConcurrency: number
}

export const defaultSettings: Settings = {
  cryptoConcurrency: DEFAULT_CONCURRENT_ENCRYPTION_LIMIT,
  downloadConcurrency: DEFAULT_CONCURRENT_DOWNLOADS_LIMIT,
  fileConcurrency: DEFAULT_CONCURRENT_FILE_READS_LIMIT,
  bytesPerFileChunk: DEFAULT_UPLOAD_FILE_CHUNK_SIZE,
  optOutAnalytics: false,
  uploadConcurrency: DEFAULT_CONCURRENT_UPLOADS_LIMIT,
}

export function parseSettings(rawSettings: string | Buffer): Settings {
  const parsedSettings = JSON.parse(rawSettings.toString())

  return Object.assign({}, defaultSettings, parsedSettings)
}

export const validationSchema = Yup.object().shape({
  cryptoConcurrency: Yup.number().min(1),
  downloadConcurrency: Yup.number().min(1),
  fileConcurrency: Yup.number().min(1),
  bytesPerFileChunk: Yup.number().min(5 * 100 * 1000),
  optOutAnalytics: Yup.boolean(),
  uploadConcurrency: Yup.number().min(1),
})

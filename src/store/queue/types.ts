import { EnqueueableAction } from 'typesafe-actions'

export enum Queue {
  Download = 'Download',
  LibraryAddition = 'LibraryAddition',
  ReadFile = 'ReadFile',
  RecordOperation = 'RecordOperation',
  Upload = 'Upload',
}

export type QueueKeys = keyof typeof Queue

export interface Job {
  action: EnqueueableAction
  id: JobId
  queue: Queue
}

export type JobId = string

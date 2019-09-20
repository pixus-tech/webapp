import { EnqueueableAction } from 'typesafe-actions'

export enum Queue {
  Download = 'Download',
  LibraryAddition = 'LibraryAddition',
  ReadFile = 'ReadFile',
  RecordOperation = 'RecordOperation',
  Upload = 'Upload',
}

export type QueueKeys = keyof typeof Queue

export type JobId = string
export type JobGroupId = string

export interface Job {
  action: EnqueueableAction
  groupId: JobGroupId
  id: JobId
  queue: Queue
}

import { createStandardAction } from 'typesafe-actions'

import { Queue, Job } from './types'

export const startQueueWorker = createStandardAction('QUEUE__START_WORK')<
  number
>()

export const stopQueueWorker = createStandardAction('QUEUE__STOP_WORK')<
  undefined
>()

export const _enqueueJob = createStandardAction('QUEUE__ENQUEUE_JOB')<Job>()

export const _dequeueJob = createStandardAction('QUEUE__DEQUEUE_JOB')<Queue>()

export const _performJob = createStandardAction('QUEUE__PERFORM_JOB')<Job>()

export const _jobDidSucceed = createStandardAction('QUEUE__JOB_SUCCEEDED')<
  Job
>()

export const _jobDidFail = createStandardAction('QUEUE__JOB_FAILED')<Job>()

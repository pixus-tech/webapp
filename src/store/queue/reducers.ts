import { List, Map, OrderedMap } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import * as actions from './actions'
import { Queue, QueueKeys, JobId, Job } from './types'

import {
  DEFAULT_CONCURRENT_DOWNLOADS_LIMIT,
  DEFAULT_CONCURRENT_FILE_READS_LIMIT,
  DEFAULT_CONCURRENT_LIBRARY_ADDITIONS_LIMIT,
  DEFAULT_CONCURRENT_RECORD_OPERATIONS_LIMIT,
  DEFAULT_CONCURRENT_UPLOADS_LIMIT,
} from 'constants/index'

export const initialState = {
  isRunning: false,
  jobs: Map<QueueKeys, OrderedMap<JobId, Job>>([
    [Queue.Download, OrderedMap<JobId, Job>()],
    [Queue.LibraryAddition, OrderedMap<JobId, Job>()],
    [Queue.ReadFile, OrderedMap<JobId, Job>()],
    [Queue.RecordOperation, OrderedMap<JobId, Job>()],
    [Queue.Upload, OrderedMap<JobId, Job>()],
  ]),
  limits: Map<QueueKeys, number>([
    [Queue.Download, DEFAULT_CONCURRENT_DOWNLOADS_LIMIT],
    [Queue.LibraryAddition, DEFAULT_CONCURRENT_LIBRARY_ADDITIONS_LIMIT],
    [Queue.ReadFile, DEFAULT_CONCURRENT_FILE_READS_LIMIT],
    [Queue.RecordOperation, DEFAULT_CONCURRENT_RECORD_OPERATIONS_LIMIT],
    [Queue.Upload, DEFAULT_CONCURRENT_UPLOADS_LIMIT],
  ]),
  queues: Map<QueueKeys, List<JobId>>([
    [Queue.Download, List<JobId>()],
    [Queue.LibraryAddition, List<JobId>()],
    [Queue.ReadFile, List<JobId>()],
    [Queue.RecordOperation, List<JobId>()],
    [Queue.Upload, List<JobId>()],
  ]),
  runningJobs: Map<QueueKeys, List<JobId>>([
    [Queue.Download, List<JobId>()],
    [Queue.LibraryAddition, List<JobId>()],
    [Queue.ReadFile, List<JobId>()],
    [Queue.RecordOperation, List<JobId>()],
    [Queue.Upload, List<JobId>()],
  ]),
  failedJobs: Map<QueueKeys, List<JobId>>([
    [Queue.Download, List<JobId>()],
    [Queue.LibraryAddition, List<JobId>()],
    [Queue.ReadFile, List<JobId>()],
    [Queue.RecordOperation, List<JobId>()],
    [Queue.Upload, List<JobId>()],
  ]),
}

const isRunning = createReducer(initialState.isRunning)
  .handleAction(actions.startQueueWorker, (_state, _action) => {
    return true
  })
  .handleAction(actions.stopQueueWorker, (_state, _action) => {
    return false
  })

type JobActionType = ReturnType<typeof actions._enqueueJob> |
                     ReturnType<typeof actions._performJob> |
                     ReturnType<typeof actions._jobDidFail> |
                     ReturnType<typeof actions._jobDidSucceed>

function jobId(action: JobActionType) {
  return action.payload.id
}

type QueueStoreTypes = OrderedMap<JobId, Job> | number | List<JobId>

function setQueueState<
  T extends QueueStoreTypes,
  StateMap extends Map<QueueKeys, QueueStoreTypes> = Map<QueueKeys, T>
>() {
  return (cb: (queueData: T, job: Job) => T) => {
    return (state: StateMap, action: JobActionType) => {
      const queueData = state.get(action.payload.queue)! as T
      return state.set(action.payload.queue, cb(queueData, action.payload))
    }
  }
}

const setFailedJobsQueue = setQueueState<List<JobId>>()
const failedJobs = createReducer(initialState.failedJobs)
  .handleAction(actions._jobDidFail, setFailedJobsQueue((queueData, job) =>
    queueData.push(job.id)))

const setJobsQueue = setQueueState<OrderedMap<JobId, Job>>()
const jobs = createReducer(initialState.jobs)
  .handleAction(actions._enqueueJob, setJobsQueue((queueData, job) =>
    queueData.set(job.id, job)))
  .handleAction(actions._jobDidSucceed, setJobsQueue((queueData, job) =>
    queueData.delete(job.id)))

const limits = createReducer(initialState.limits)

const setQueuesQueue = setQueueState<List<JobId>>()
const queues = createReducer(initialState.queues)
  .handleAction(actions._enqueueJob, setQueuesQueue((queueData, job) =>
    queueData.push(job.id)))
  .handleAction(actions._performJob, setQueuesQueue((queueData, job) =>
    queueData.filterNot(id => id === job.id)))

const setRunningJobsQueue = setQueueState<List<JobId>>()
const runningJobs = createReducer(initialState.runningJobs)
  .handleAction(actions._performJob, setRunningJobsQueue((queueData, job) =>
    queueData.push(job.id)))
  .handleAction([actions._jobDidSucceed, actions._jobDidFail], setRunningJobsQueue((queueData, job) =>
    queueData.filterNot(id => id === job.id)))

export default combineReducers({
  isRunning,
  failedJobs,
  jobs,
  limits,
  queues,
  runningJobs,
})

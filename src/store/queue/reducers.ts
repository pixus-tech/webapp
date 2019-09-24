import { List, Map, OrderedMap } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import * as actions from './actions'
import { Queue, QueueKeys, JobId, JobGroupId, Job } from './types'

import {
  DEFAULT_CONCURRENT_DOWNLOADS_LIMIT,
  DEFAULT_CONCURRENT_FILE_READS_LIMIT,
  DEFAULT_CONCURRENT_RECORD_OPERATIONS_LIMIT,
  DEFAULT_CONCURRENT_UPLOADS_LIMIT,
} from 'constants/index'

export const initialState = {
  isRunning: false,
  jobGroups: Map<JobGroupId, List<JobId>>(),
  jobs: OrderedMap<JobId, Job>(),
  runningJobsMap: Map<JobId, boolean>(),
  limits: Map<QueueKeys, number>([
    [Queue.Download, DEFAULT_CONCURRENT_DOWNLOADS_LIMIT],
    [Queue.ReadFile, DEFAULT_CONCURRENT_FILE_READS_LIMIT],
    [Queue.RecordOperation, DEFAULT_CONCURRENT_RECORD_OPERATIONS_LIMIT],
    [Queue.Upload, DEFAULT_CONCURRENT_UPLOADS_LIMIT],
  ]),
  queues: Map<QueueKeys, List<JobId>>([
    [Queue.Download, List<JobId>()],
    [Queue.ReadFile, List<JobId>()],
    [Queue.RecordOperation, List<JobId>()],
    [Queue.Upload, List<JobId>()],
  ]),
  runningJobCounts: Map<QueueKeys, number>([
    [Queue.Download, 0],
    [Queue.ReadFile, 0],
    [Queue.RecordOperation, 0],
    [Queue.Upload, 0],
  ]),
  failedJobs: List<JobId>(),
}

const isRunning = createReducer(initialState.isRunning)
  .handleAction(actions.startQueueWorker, (_state, _action) => true)
  .handleAction(actions.stopQueueWorker, (_state, _action) => false)

const jobGroups = createReducer(initialState.jobGroups)
  .handleAction(actions._enqueueJob, (state, action) => {
    const groupId = action.payload.groupId
    const groupJobIds = state.get(groupId) || List<JobId>()
    return state.set(groupId, groupJobIds.push(action.payload.id))
  })
  .handleAction(
    [actions._jobDidSucceed, actions._jobDidFail],
    (state, action) => {
      const groupId = action.payload.groupId
      const groupJobIds = state.get(groupId) || List<JobId>()
      const nextJobIds = groupJobIds.filterNot(id => id === action.payload.id)
      return nextJobIds.size === 0
        ? state.delete(groupId)
        : state.set(groupId, nextJobIds)
    },
  )
  .handleAction(actions._cancelJob, (state, action) => {
    const filteredState = state.mapEntries(([groupId, jobIds]) => [
      groupId,
      jobIds.filterNot(jobId => jobId === action.payload.jobId),
    ])
    const deleteKey = filteredState.findKey(ids => ids.size === 0)
    if (deleteKey !== undefined) {
      return filteredState.delete(deleteKey)
    }
    return filteredState
  })

const failedJobs = createReducer(initialState.failedJobs).handleAction(
  actions._jobDidFail,
  (state, action) => state.push(action.payload.id),
)

const jobs = createReducer(initialState.jobs)
  .handleAction(actions._enqueueJob, (state, action) =>
    state.set(action.payload.id, action.payload),
  )
  .handleAction(actions._jobDidSucceed, (state, action) =>
    state.delete(action.payload.id),
  )
  .handleAction(actions._cancelJob, (state, action) =>
    state.delete(action.payload.jobId),
  )

const limits = createReducer(initialState.limits)

const queues = createReducer(initialState.queues)
  .handleAction(actions._enqueueJob, (state, action) => {
    const queueData = state.get(action.payload.queue)
    if (queueData === undefined) return state
    return state.set(action.payload.queue, queueData.push(action.payload.id))
  })
  .handleAction(actions._performJob, (state, action) => {
    const queueData = state.get(action.payload.queue)
    if (queueData === undefined) return state
    return state.set(
      action.payload.queue,
      queueData.filterNot(id => id === action.payload.id),
    )
  })
  .handleAction(actions._cancelJob, (state, action) =>
    state.mapEntries(([queue, jobIds]) => [
      queue,
      jobIds.filterNot(jobId => jobId === action.payload.jobId),
    ]),
  )

const runningJobCounts = createReducer(initialState.runningJobCounts)
  .handleAction(actions._performJob, (state, action) =>
    state.set(action.payload.queue, state.get(action.payload.queue)! + 1),
  )
  .handleAction(
    [actions._jobDidSucceed, actions._jobDidFail],
    (state, action) =>
      state.set(action.payload.queue, state.get(action.payload.queue)! - 1),
  )
  .handleAction([actions._cancelJob], (state, action) => {
    if (!action.payload.isRunning) {
      return state
    }
    return state.set(action.payload.queue, state.get(action.payload.queue)! - 1)
  })

const runningJobsMap = createReducer(initialState.runningJobsMap)
  .handleAction(actions._performJob, (state, action) =>
    state.set(action.payload.id, true),
  )
  .handleAction(
    [actions._jobDidSucceed, actions._jobDidFail],
    (state, action) => state.delete(action.payload.id),
  )
  .handleAction(actions._cancelJob, (state, action) =>
    state.delete(action.payload.jobId),
  )

export default combineReducers({
  isRunning,
  failedJobs,
  jobGroups,
  jobs,
  limits,
  queues,
  runningJobsMap,
  runningJobCounts,
})

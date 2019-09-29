import { Epic } from 'redux-observable'
import { of, race, interval } from 'rxjs'
import {
  filter,
  mergeMap,
  map,
  take,
  throttle,
  withLatestFrom,
} from 'rxjs/operators'
import {
  isActionOf,
  RootAction,
  RootState,
  EnqueueableAction,
} from 'typesafe-actions'

import * as actions from './actions'
import { Queue } from './types'
import { WORKER_THROTTLE_INTERVAL } from 'constants/index'

export const enqueueJobEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(
      action =>
        isActionOf(actions._enqueueJob)(action) ||
        isActionOf(actions._jobDidFail)(action) ||
        isActionOf(actions._jobDidSucceed)(action),
    ),
    throttle(() => interval(WORKER_THROTTLE_INTERVAL)),
    withLatestFrom(state$),
    filter(([_, state]) => state.queue.isRunning),
    mergeMap(([_, state]) => {
      const dequeueActions = []

      const downloadQueue = state.queue.queues.get(Queue.Download)
      if (downloadQueue !== undefined && downloadQueue.size > 0) {
        dequeueActions.push(actions._dequeueJob(Queue.Download))
      }

      const readFileQueue = state.queue.queues.get(Queue.ReadFile)
      if (readFileQueue !== undefined && readFileQueue.size > 0) {
        dequeueActions.push(actions._dequeueJob(Queue.ReadFile))
      }
      const recordOperationQueue = state.queue.queues.get(Queue.RecordOperation)
      if (recordOperationQueue !== undefined && recordOperationQueue.size > 0) {
        dequeueActions.push(actions._dequeueJob(Queue.RecordOperation))
      }

      const uploadQueue = state.queue.queues.get(Queue.Upload)
      if (uploadQueue !== undefined && uploadQueue.size > 0) {
        dequeueActions.push(actions._dequeueJob(Queue.Upload))
      }

      return of(...dequeueActions)
    }),
  )

export const dequeueJobEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions._dequeueJob)),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const performActions: RootAction[] = []
      const queue = state.queue.queues.get(action.payload)
      const queueLimit = state.queue.limits.get(action.payload)
      const runningJobsCount = state.queue.runningJobCounts.get(action.payload)

      if (
        queueLimit !== undefined &&
        queue !== undefined &&
        runningJobsCount !== undefined &&
        runningJobsCount < queueLimit
      ) {
        queue
          .slice(0, queueLimit - runningJobsCount)
          .forEach((jobId: string) => {
            const job = state.queue.jobs.get(jobId)
            if (job !== undefined) {
              performActions.push(actions._performJob(job))
            }
          })
      }

      return of(...performActions)
    }),
  )

export const cancelJobGroupEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.cancelJobGroup)),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const groupId = action.payload
      const performActions: RootAction[] = []
      const jobIdsToCancel = state.queue.jobGroups.get(groupId)

      if (jobIdsToCancel !== undefined) {
        jobIdsToCancel.forEach(jobId => {
          const job = state.queue.jobs.get(jobId)
          const isRunning = state.queue.runningJobsMap.get(jobId) || false
          if (job !== undefined) {
            performActions.push(
              actions._cancelJob({ jobId, queue: job.queue, isRunning }),
            )
          }
        })
      }

      return of(...performActions)
    }),
  )

export const performJobEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
  { files },
) =>
  action$.pipe(
    filter(isActionOf(actions._performJob)),
    map(action => action.payload.action),
  )

export const jobProgressEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
  { files },
) =>
  action$.pipe(
    filter(isActionOf(actions._performJob)),
    mergeMap(action =>
      race(
        action$.pipe(
          filter(
            successAction =>
              successAction.type ===
                action.payload.action.type.replace('__REQUEST', '__SUCCESS') &&
              (successAction as EnqueueableAction).payload.jobId ===
                action.payload.id,
          ),
          take(1),
          map(successAction => actions._jobDidSucceed(action.payload)),
        ),
        action$.pipe(
          filter(
            errorAction =>
              errorAction.type ===
                action.payload.action.type.replace('__REQUEST', '__FAILURE') &&
              (errorAction as EnqueueableAction).payload.jobId ===
                action.payload.id,
          ),
          take(1),
          map(errorAction => actions._jobDidFail(action.payload)),
        ),
        action$.pipe(
          filter(
            cancelAction =>
              cancelAction.type ===
                action.payload.action.type.replace('__REQUEST', '__CANCEL') &&
              (cancelAction as EnqueueableAction).payload.jobId ===
                action.payload.id,
          ),
          take(1),
          map(errorAction => actions._jobDidFail(action.payload)),
        ), // TODO: Add job cancelling here?
      ),
    ),
  )

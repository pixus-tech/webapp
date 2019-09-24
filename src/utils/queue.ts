import _ from 'lodash'
import { ActionsObservable } from 'redux-observable'
import { Observable, of, race, merge } from 'rxjs'
import { bufferCount, filter, mergeMap, take } from 'rxjs/operators'
import {
  AsyncActionCreator,
  EnqueueableAction,
  PayloadAC,
  RootAction,
  TypeConstant,
  createStandardAction,
  isActionOf,
} from 'typesafe-actions'
import uuid from 'uuid/v4'

import { _cancelJobGroup, _enqueueJob } from 'store/queue/actions'
import { JobId, JobGroupId, Queue } from 'store/queue/types'

export interface IdentifiableAction {
  groupId: JobGroupId
  jobId: JobId
}

export interface QueuePayload<Payload> extends IdentifiableAction {
  data: Payload
}

export interface CancelJobPayload {
  groupId?: JobGroupId
  jobId?: JobId
}

interface QueueOptions<Payload> {
  queue: Queue
  payload: Payload
}

interface ResultActions<AP1, QP2, QP3> {
  success: (requestData: AP1, successData: QP2) => RootAction[]
  error: (requestData: AP1, errorData: QP3) => RootAction[]
  cancel?: (requestData: AP1, cancelData: CancelJobPayload) => RootAction[]
}

export function cancelJobGroup(groupId: JobGroupId) {
  return _cancelJobGroup(groupId)
}

export function enqueueAction<P>(
  queue: Queue,
  groupId: JobGroupId,
  actionCreator: PayloadAC<EnqueueableAction['type'], QueuePayload<P>>,
  payload: P,
) {
  const jobId = uuid()
  return _enqueueJob({
    action: actionCreator({
      groupId,
      jobId,
      data: payload,
    }) as EnqueueableAction,
    groupId,
    id: jobId,
    queue,
  })
}

export function listenToActionStream(action$: ActionsObservable<RootAction>) {
  return {
    andPerformAction: function<
      AT1 extends TypeConstant,
      AT2 extends TypeConstant,
      AT3 extends TypeConstant,
      AT4 extends TypeConstant,
      AP1,
      AP2,
      AP3
    >(
      actionCreator: AsyncActionCreator<
        [AT1, AP1],
        [AT2, AP2],
        [AT3, AP3],
        [AT4, AP1],
        AT1,
        AP1
      >,
    ) {
      return {
        byAsynchronouslyExecuting: function<
          QT1 extends EnqueueableAction['type'],
          QT2 extends EnqueueableAction['type'],
          QT3 extends EnqueueableAction['type'],
          QT4 extends EnqueueableAction['type'],
          QP1,
          QP2,
          QP3,
          QP4 extends CancelJobPayload
        >(
          enqueueableActionCreator: AsyncActionCreator<
            [QT1, QueuePayload<QP1>],
            [QT2, QueuePayload<QP2>],
            [QT3, QueuePayload<QP3>],
            [QT4, QP4]
          >,
        ) {
          return {
            withGroupId: function(
              groupIdCreator: (requestData: AP1) => string,
            ) {
              return {
                andJobs: function(
                  jobsCreator: (requestData: AP1) => QueueOptions<QP1>[],
                ) {
                  return {
                    andResultCallbacks: function(
                      resultActions: ResultActions<AP1, QP2, QP3>,
                    ): Observable<RootAction> {
                      return action$.pipe(
                        filter(
                          isActionOf(actionCreator.request as PayloadAC<
                            AT1,
                            AP1
                          >),
                        ),
                        mergeMap(action => {
                          const groupId = groupIdCreator(action.payload)
                          const jobs = _.map(
                            jobsCreator(action.payload),
                            queueOptions =>
                              enqueueAction(
                                queueOptions.queue,
                                groupId,
                                enqueueableActionCreator.request,
                                queueOptions.payload,
                              ),
                          )

                          return merge(
                            of(...jobs),
                            race(
                              action$.pipe(
                                filter(
                                  isActionOf(enqueueableActionCreator.success),
                                ),
                                filter(
                                  successAction =>
                                    successAction.payload.groupId === groupId,
                                ),
                                bufferCount(jobs.length),
                                take(1),
                                mergeMap(([successAction]) =>
                                  of(
                                    ...resultActions.success(
                                      action.payload,
                                      successAction.payload.data,
                                    ),
                                  ),
                                ),
                              ),
                              action$.pipe(
                                filter(
                                  isActionOf(enqueueableActionCreator.failure),
                                ),
                                filter(
                                  errorAction =>
                                    errorAction.payload.groupId === groupId,
                                ),
                                take(1),
                                mergeMap(errorAction =>
                                  of(
                                    ...resultActions.error(
                                      action.payload,
                                      errorAction.payload.data,
                                    ),
                                  ),
                                ),
                              ),
                              action$.pipe(
                                filter(isActionOf(actionCreator.cancel)),
                                filter(
                                  cancelAction =>
                                    groupIdCreator(
                                      _.get(cancelAction, 'payload'),
                                    ) === groupId,
                                ),
                                take(1),
                                mergeMap(cancelAction => {
                                  const cancelJobPayload = {
                                    groupId,
                                    jobId: undefined,
                                  } as QP4
                                  const cancelActions: RootAction[] = [
                                    (enqueueableActionCreator.cancel as PayloadAC<
                                      any,
                                      QP4
                                    >)(cancelJobPayload),
                                  ]

                                  if (resultActions.cancel !== undefined) {
                                    cancelActions.push(
                                      ...resultActions.cancel(
                                        action.payload,
                                        cancelJobPayload,
                                      ),
                                    )
                                  }

                                  cancelActions.push(_cancelJobGroup(groupId))

                                  return of(...cancelActions)
                                }),
                              ),
                            ),
                          )
                        }),
                      ) as Observable<RootAction>
                    },
                  }
                },
              }
            },
          }
        },
      }
    },
  }
}

interface EnqueueableActionBuilder<
  TType1 extends TypeConstant,
  TType2 extends TypeConstant,
  TType3 extends TypeConstant,
  TType4 extends TypeConstant
> {
  <
    TPayload1 extends IdentifiableAction,
    TPayload2 extends IdentifiableAction,
    TPayload3 extends IdentifiableAction,
    TPayload4 extends CancelJobPayload
  >(): AsyncActionCreator<
    [TType1, TPayload1],
    [TType2, TPayload2],
    [TType3, TPayload3],
    [TType4, TPayload4]
  >
}

function checkInvalidActionTypeInArray(
  arg: TypeConstant,
  idx: number,
): void | never {
  if (arg == null) {
    throw new Error(
      `Argument contains array with empty element at index ${idx}`,
    )
  } else if (typeof arg !== 'string' && typeof arg !== 'symbol') {
    throw new Error(
      `Argument contains array with invalid element at index ${idx}, it should be of type: string | symbol`,
    )
  }
}

export function createEnqueueableAction<
  TType1 extends TypeConstant,
  TType2 extends TypeConstant,
  TType3 extends TypeConstant,
  TType4 extends TypeConstant
>(
  requestType: TType1,
  successType: TType2,
  failureType: TType3,
  cancelType: TType4,
): EnqueueableActionBuilder<TType1, TType2, TType3, TType4> {
  ;[requestType, successType, failureType, cancelType].forEach(
    checkInvalidActionTypeInArray,
  )

  const constructor = (<
    TPayload1 extends IdentifiableAction,
    TPayload2 extends IdentifiableAction,
    TPayload3 extends IdentifiableAction,
    TPayload4 extends CancelJobPayload
  >() => {
    return {
      request: createStandardAction(requestType)<TPayload1>(),
      success: createStandardAction(successType)<TPayload2>(),
      failure: createStandardAction(failureType)<TPayload3>(),
      cancel: createStandardAction(cancelType)<TPayload4>(),
    }
  }) as EnqueueableActionBuilder<TType1, TType2, TType3, TType4>

  const api = Object.assign<
    EnqueueableActionBuilder<TType1, TType2, TType3, TType4>,
    {}
  >(constructor, {
    // extension point for chain api
  })

  return api
}

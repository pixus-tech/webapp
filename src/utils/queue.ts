import {
  AsyncActionCreator,
  EnqueueableAction,
  PayloadAC,
  TypeConstant,
  createStandardAction,
} from 'typesafe-actions'
import uuid from 'uuid/v4'

import { _enqueueJob } from 'store/queue/actions'
import { JobId, Queue } from 'store/queue/types'

export interface QueuePayload<Payload> {
  jobId: JobId
  data: Payload
}

export interface CancelJobPayload {
  jobId: JobId
}

export interface IdentifiableAction {
  jobId: JobId
}

export function enqueueAction<
  P,
  AC extends PayloadAC<EnqueueableAction['type'], QueuePayload<P>>
>(queue: Queue, actionCreator: AC, payload: P) {
  const jobId = uuid()
  return _enqueueJob({
    action: actionCreator({
      jobId,
      data: payload,
    }) as EnqueueableAction,
    id: jobId,
    queue,
  })
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
    TPayload4 extends IdentifiableAction
  >(): AsyncActionCreator<
    [TType1, TPayload1],
    [TType2, TPayload2],
    [TType3, TPayload3],
    [TType4, TPayload4]
  >
  <
    TPayload1 extends IdentifiableAction,
    TPayload2 extends IdentifiableAction,
    TPayload3 extends IdentifiableAction
  >(): AsyncActionCreator<
    [TType1, TPayload1],
    [TType2, TPayload2],
    [TType3, TPayload3]
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
  cancelType?: TType4,
): EnqueueableActionBuilder<TType1, TType2, TType3, TType4> {
  ;[requestType, successType, failureType].forEach(
    checkInvalidActionTypeInArray,
  )

  const constructor = (<
    TPayload1 extends IdentifiableAction,
    TPayload2 extends IdentifiableAction,
    TPayload3 extends IdentifiableAction,
    TPayload4 extends IdentifiableAction
  >() => {
    return {
      request: createStandardAction(requestType)<TPayload1>(),
      success: createStandardAction(successType)<TPayload2>(),
      failure: createStandardAction(failureType)<TPayload3>(),
      cancel: cancelType && createStandardAction(cancelType)<TPayload4>(),
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

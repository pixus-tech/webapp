import { createAsyncAction, createStandardAction } from 'typesafe-actions'

export const probeConnectivity = createStandardAction('CONNECTIVITY__PROBE')<
  undefined
>()

export const probeHubConnectivity = createAsyncAction(
  'CONNECTIVITY__PROBE_HUB__REQUEST',
  'CONNECTIVITY__PROBE_HUB__SUCCESS',
  'CONNECTIVITY__PROBE_HUB__FAILURE',
  'CONNECTIVITY__PROBE_HUB__CANCEL',
)<undefined, boolean, undefined, undefined>()

export const probeRadiksConnectivity = createAsyncAction(
  'CONNECTIVITY__PROBE_RADIKS__REQUEST',
  'CONNECTIVITY__PROBE_RADIKS__SUCCESS',
  'CONNECTIVITY__PROBE_RADIKS__FAILURE',
  'CONNECTIVITY__PROBE_RADIKS__CANCEL',
)<undefined, boolean, undefined, undefined>()

export const probeBlockstackConnectivity = createAsyncAction(
  'CONNECTIVITY__PROBE_BLOCKSTACK__REQUEST',
  'CONNECTIVITY__PROBE_BLOCKSTACK__SUCCESS',
  'CONNECTIVITY__PROBE_BLOCKSTACK__FAILURE',
  'CONNECTIVITY__PROBE_BLOCKSTACK__CANCEL',
)<undefined, boolean, undefined, undefined>()

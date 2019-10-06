import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import * as actions from './actions'

export const initialState = {
  blockstack: null as boolean | null,
  hub: null as boolean | null,
  radiks: null as boolean | null,
}

const blockstack = createReducer(initialState.blockstack)
  .handleAction(actions.probeConnectivity, (_state, _action) => null)
  .handleAction(
    actions.probeBlockstackConnectivity.success,
    (_state, action) => action.payload,
  )
  .handleAction(
    [actions.probeBlockstackConnectivity.failure],
    (_state, _action) => false,
  )

const hub = createReducer(initialState.hub)
  .handleAction(actions.probeConnectivity, (_state, _action) => null)
  .handleAction(
    actions.probeHubConnectivity.success,
    (_state, action) => action.payload,
  )
  .handleAction(
    [actions.probeHubConnectivity.failure],
    (_state, _action) => false,
  )

const radiks = createReducer(initialState.radiks)
  .handleAction(actions.probeConnectivity, (_state, _action) => null)
  .handleAction(
    actions.probeRadiksConnectivity.success,
    (_state, action) => action.payload,
  )
  .handleAction(
    [actions.probeRadiksConnectivity.failure],
    (_state, _action) => false,
  )

export default combineReducers({
  blockstack,
  hub,
  radiks,
})

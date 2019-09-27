import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import * as actions from './actions'
import { ModalType, ModalProps } from './types'

export const initialState = {
  type: null as null | ModalType,
  props: null as null | ModalProps,
}

const type = createReducer(initialState.type)
  .handleAction(actions.showModal, (_state, action) => action.payload.type)
  .handleAction(actions.hideModal, (_state, _action) => null)

const props = createReducer(initialState.props)
  .handleAction(actions.showModal, (_state, action) => action.payload.props)
  .handleAction(actions.hideModal, (_state, _action) => null)

export default combineReducers({
  type,
  props,
})

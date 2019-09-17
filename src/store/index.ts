import localForage from 'localforage'
import { createStore, applyMiddleware } from 'redux'
import logger from 'redux-logger'
import { createEpicMiddleware } from 'redux-observable'
import { persistStore, persistReducer } from 'redux-persist'
import services from 'services'
import { RootAction, RootService, RootState } from 'typesafe-actions'

import {
  DELAY_TO_LAUNCH_WORKER_QUEUE,
  LAUNCH_WORKER_PERIOD,
} from 'constants/index'
import { composeEnhancer } from './utils'
import { startTimer } from './timer/actions'

import rootEpic from './rootEpic'
import rootReducer from './rootReducer'

const epicMiddleware = createEpicMiddleware<
  RootAction,
  RootAction,
  RootState,
  RootService
>({
  dependencies: services,
})

localForage.config({
  name: 'reveries',
  version: 0.1,
  storeName: 'reveries',
})

const persistConfig = {
  key: 'root',
  storage: localForage,
  whitelist: ['auth', 'i18n'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const middlewares = [epicMiddleware, logger]
const enhancer = composeEnhancer(applyMiddleware(...middlewares))
const store = createStore(persistedReducer, {}, enhancer)
const persistor = persistStore(store)
epicMiddleware.run(rootEpic)

setTimeout(() => {
  store.dispatch(startTimer(LAUNCH_WORKER_PERIOD))
}, DELAY_TO_LAUNCH_WORKER_QUEUE)

export default { persistor, store }

import localForage from 'localforage'
import { applyMiddleware, createStore, Store } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { persistStore, persistReducer } from 'redux-persist'
import immutableTransform from 'redux-persist-transform-immutable'
import services from 'services'
import { RootAction, RootService, RootState } from 'typesafe-actions'

import { composeEnhancer } from './utils'

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
  name: 'pixus-store',
  version: 1,
  storeName: 'pixus-store',
})

const persistConfig = {
  key: 'root',
  storage: localForage,
  transforms: [immutableTransform()],
  whitelist: ['auth', 'i18n', 'settings'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const middlewares = [epicMiddleware]
const enhancer = composeEnhancer(applyMiddleware(...middlewares))
const store: Store<RootState, RootAction> = createStore(
  persistedReducer,
  {},
  enhancer,
)
const persistor = persistStore(store)
epicMiddleware.run(rootEpic)

services.images.connect(store)

export default { persistor, store }

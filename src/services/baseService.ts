import { Store } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import blobStore from './blobStore'
import dispatcher from './dispatcher'
import { getConfig } from './config'

import SettingsSchema, { defaultSettings } from 'models/settings'

type StoreType = Store<RootState, RootAction>
export default class BaseService {
  protected blobStore = blobStore
  protected dispatcher = dispatcher
  protected config = getConfig()
  protected settings = defaultSettings
  private store?: StoreType

  protected dispatch = (action: RootAction) => {
    if (this.store !== undefined) {
      this.store.dispatch(action)
    }
  }

  configure = (settings: SettingsSchema) => (this.settings = settings)
  connect = (store: StoreType) => (this.store = store)
}

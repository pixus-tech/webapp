import Dispatcher from './dispatcher'
import { getConfig } from './config'

import SettingsSchema, { defaultSettings } from 'models/settings'

export default class BaseService {
  protected dispatcher = Dispatcher.sharedInstance()
  protected config = getConfig()
  protected settings = defaultSettings

  configure = (settings: SettingsSchema) => (this.settings = settings)
}

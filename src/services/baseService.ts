import Dispatcher from './dispatcher'
import { getConfig } from './config'

export default class BaseService {
  protected dispatcher = Dispatcher.sharedInstance()
  protected config = getConfig()
}

import Dispatcher from './dispatcher'

export default class BaseService {
  protected dispatcher = Dispatcher.sharedInstance()
}

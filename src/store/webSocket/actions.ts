import { createStandardAction } from 'typesafe-actions'

export const subscribeWebSocket = createStandardAction('WEB_SOCKET__SUBSCRIBE')<
  undefined
>()

export const unsubscribeWebSocket = createStandardAction(
  'WEB_SOCKET__UNSUBSCRIBE',
)<undefined>()

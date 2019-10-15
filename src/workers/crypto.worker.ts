/* global blockstack, importScripts */
// eslint-disable-next-line no-restricted-globals
declare const blockstack: any

let _userSession: any

const BLOCKSTACK_SESSION_STORE = {
  cache: {},
  getSessionData() {
    return this.cache
  },
  setSessionData(data: any) {
    return (this.cache = data)
  },
  deleteSessionData() {
    return (this.cache = {})
  },
}

function sharedUserSession() {
  if (!_userSession) {
    importScripts('/blockstack.js')

    _userSession = new blockstack.UserSession({
      appConfig: new blockstack.AppConfig({
        appDomain: location.origin,
      }),
      sessionStore: BLOCKSTACK_SESSION_STORE,
    })
  }

  return _userSession
}

addEventListener('message', event => {
  const userSession = sharedUserSession()
  const { id, job, buffer, key } = event.data

  if (job === 'encrypt') {
    const result = userSession.encryptContent(buffer, { publicKey: key })
    postMessage({ id, result })
  } else if (job === 'decrypt') {
    const result = userSession.decryptContent(buffer, {
      privateKey: key,
    })
    postMessage({ id, result })
  }
})

export default null

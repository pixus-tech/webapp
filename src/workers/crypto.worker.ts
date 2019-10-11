/* global blockstack */
// @ts-ignore isolatedModules
// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any

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

    // @ts-ignore
    _userSession = new blockstack.UserSession({
      // @ts-ignore
      appConfig: new blockstack.AppConfig({
        appDomain: location.origin,
      }),
      sessionStore: BLOCKSTACK_SESSION_STORE,
    })
  }

  return _userSession
}

ctx.addEventListener('message', event => {
  // @ts-ignore
  const userSession = sharedUserSession()
  const { id, job, buffer, key } = event.data

  if (job === 'encrypt') {
    const result = userSession.encryptContent(buffer, { publicKey: key })
    ctx.postMessage({ id, result })
  } else if (job === 'decrypt') {
    const result = userSession.decryptContent(buffer, {
      privateKey: key,
    })
    ctx.postMessage({ id, result })
  }
})

import * as blockstack from 'blockstack'
// eslint-disable-next-line no-restricted-globals
const ctx = (self as any) as DedicatedWorkerGlobalScope // eslint-disable-line no-restricted-globals
ctx.importScripts('/static/js/crypto.js')

const BLOCKSTACK_SESSION_STORE = {
  cache: {} as any,
  getSessionData() {
    return this.cache
  },
  setSessionData(data: any) {
    return (this.cache = data)
  },
  deleteSessionData() {
    this.cache = {}
    return true
  },
}

const userSession = new blockstack.UserSession({
  appConfig: new blockstack.AppConfig([], ctx.location.origin),
  sessionStore: BLOCKSTACK_SESSION_STORE,
})

ctx.addEventListener('message', event => {
  const { id, job, buffer, key } = event.data

  try {
    if (job === 'encrypt') {
      const result = userSession.encryptContent(buffer, { publicKey: key })
      ctx.postMessage({ id, result })
    } else if (job === 'decrypt') {
      const result = userSession.decryptContent(buffer, {
        privateKey: key,
      })
      ctx.postMessage({ id, result })
    }
  } catch (error) {
    ctx.postMessage({ id, error })
  }
})

export default null

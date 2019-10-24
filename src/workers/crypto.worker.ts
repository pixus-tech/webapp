import * as Blockstack from 'blockstack'
declare const blockstack: typeof Blockstack
declare const self: DedicatedWorkerGlobalScope

self.importScripts('/static/js/blockstack.dev.js')

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
  appConfig: new blockstack.AppConfig([], self.location.origin),
  sessionStore: BLOCKSTACK_SESSION_STORE,
})

self.addEventListener('message', event => {
  const { id, job, buffer, key } = event.data

  try {
    if (job === 'encrypt') {
      const result = userSession.encryptContent(buffer, { publicKey: key })
      self.postMessage({ id, result })
    } else if (job === 'decrypt') {
      const result = userSession.decryptContent(buffer, {
        privateKey: key,
      })
      self.postMessage({ id, result })
    } else {
      throw 'unknown job'
    }
  } catch (error) {
    self.postMessage({ id, error: `${error}` })
  }
})

export default null

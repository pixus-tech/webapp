declare module 'raw-loader!*' {
  // eslint-disable-next-line no-undef
  export = string
}

declare module 'workerize' {
  declare function workerize<T>(source: string): T
  export = workerize
}

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor()
  }

  export default WebpackWorker
}

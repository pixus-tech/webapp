declare module 'raw-loader!*' {
  export = string
}

declare module 'workerize' {
  declare function workerize<T>(source: string): T
  export = workerize
}

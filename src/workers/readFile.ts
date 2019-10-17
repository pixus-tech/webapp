import workerize from 'workerize'

// eslint-disable-next-line
import readFileWorkerSource from 'raw-loader!./readFile.worker'
import * as ReadFileWorkerType from './readFile.worker'

export const readFileWorker = workerize<typeof ReadFileWorkerType>(
  readFileWorkerSource,
)

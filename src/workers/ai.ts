// eslint-disable-next-line
import AIWorker from 'worker-loader!workers/ai.worker'
import { registerWorker, postJob } from './'

const aiWorker = new AIWorker()
registerWorker(aiWorker)

export function predict(imageData: ImageData) {
  return postJob<string>(aiWorker, 'predict.coco-ssd', { payload: imageData })
}

import * as AI from 'worker-scripts/ai'
declare const ai: typeof AI
declare const self: DedicatedWorkerGlobalScope

self.importScripts('/static/js/ai.dev.js')

const { cocoSsd } = ai.models

type ObjectDetection = any
let cocoSsdModel: undefined | ObjectDetection = undefined
function sharedCocoSsdModel() {
  return new Promise<ObjectDetection>((resolve, reject) => {
    if (cocoSsdModel !== undefined) {
      return resolve(cocoSsdModel)
    }

    cocoSsd
      .load()
      .then(model => {
        cocoSsdModel = model
        resolve(cocoSsdModel)
      })
      .catch(reject)
  })
}

self.addEventListener('message', event => {
  const { id, job, payload } = event.data

  try {
    if (job === 'predict.coco-ssd') {
      sharedCocoSsdModel()
        .then(model => {
          const imageData = payload as ImageData
          model.detect(imageData, 5)
               .then((predictions: any) => {
                 console.log('Predictions: ', predictions);
               })
               .catch((error: any) => { throw(error) });
        })
        .catch((error: any) => { throw(error) })
    } else {
      throw 'unknown job'
    }
  } catch (error) {
    self.postMessage({ id, error: `${error}` })
  }
})

export default null

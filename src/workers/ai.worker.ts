import * as tf from '@tensorflow/tfjs'
// eslint-disable-next-line no-restricted-globals
const ctx = (self as any) as DedicatedWorkerGlobalScope // eslint-disable-line no-restricted-globals

ctx.importScripts('/static/js/tf.min.js')
ctx.importScripts('/static/js/coco-ssd.min.js')

ctx.addEventListener('message', event => {
  const { id, job, payload } = event.data

  try {
    if (job === 'predict.coco-ssd') {
      console.log('predict in worker')
      // @ts-ignore
      cocoSsd.load().then(model => {
        console.log('model loaded')
        // detect objects in the image.
        const image = payload as ImageData
        model.infer(image, 5)
               .then((predictions: any) => {
                 console.log('Predictions: ', predictions);
               })
               .catch((err: any) => console.log('error in worker', err));
      });
    } else {
      throw 'unknown job'
    }
  } catch (error) {
    ctx.postMessage({ id, error: `${error}` })
  }
})

export default null

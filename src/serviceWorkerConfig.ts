export default {
  onUpdate: (registration: ServiceWorkerRegistration) => {
    console.info('An update is available. Page will reload.')
    registration.unregister().then(() => {
      window.location.reload()
    })
  },
  onSuccess: (_registration: ServiceWorkerRegistration) => {
    console.info('Service Worker registration was successful.')
  },
}

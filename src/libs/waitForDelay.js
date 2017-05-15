import storage from './storageSwitcher'
const DELAY_TIMES = [0, 200, 400, 700, 1000]

export default (callback) => {
  storage.get({delay: 1})
    .then((item) => {
      let delay = DELAY_TIMES[item.delay]
      if (delay === 0) {
        window.requestAnimationFrame(callback)
      }
      window.setTimeout(callback, delay)
    })
}

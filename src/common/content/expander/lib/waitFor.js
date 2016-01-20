module.exports = function waitFor (condition, fn) {
  const timer = window.setInterval(() => {
    if (!condition()) return
    fn()
    cancel()
  }, 100)

  function cancel () {
    window.clearInterval(timer)
  }

  return cancel
}

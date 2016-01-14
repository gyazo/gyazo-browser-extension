module.exports = function () {
  global.document = require('jsdom').jsdom()
  global.window = document.defaultView

  propagateKeysToGlobal(window)

  function propagateKeysToGlobal (window) {
    const blacklist = Object.keys(global)

    blacklist.push('constructor')
    Object.keys(window).forEach((key) => {
      if (blacklist.indexOf(key) === -1) {
        global[key] = window[key]
      }
    })
  }
}

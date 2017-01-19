// Firefox WebExtension doesn't have chrome.storage.sync but only chrome.storage.local
// https://bugzilla.mozilla.org/show_bug.cgi?id=1213475
// https://bugzilla.mozilla.org/show_bug.cgi?id=1220494
require('chrome-browser-object-polyfill')
try {
  module.exports = ('sync' in chrome.storage && typeof chrome.storage.sync === 'function')
    ? chrome.storage.sync
    : chrome.storage.local
} catch (e) {
  module.exports = {get: function (a, b) {
    throw new Error('not support chrome.storage')
  }}
}

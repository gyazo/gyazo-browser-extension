(function () {
  'use strict'
  let selector = document.getElementById('selector')
  let delaySelector = document.getElementById('delay')
  chrome.storage.sync.get({behavior: 'element', delay: 1}, function (item) {
    selector.value = item.behavior
    delaySelector.value = item.delay
  })
  document.getElementById('element').textContent = chrome.i18n.getMessage('selectElement')
  document.getElementById('area').textContent = chrome.i18n.getMessage('selectArea')

  selector.addEventListener('change', function (event) {
    chrome.storage.sync.set({behavior: event.target.value}, function () {
      document.querySelector('.selector-save').textContent = 'Saved'
      window.setTimeout(function () {
        document.querySelector('.selector-save').textContent = ''
      }, 2500)
    })
  })

  delaySelector.addEventListener('change', function (event) {
    chrome.storage.sync.set({delay: event.target.value}, function () {
      document.querySelector('.scroll-delay-save').textContent = 'Saved'
      window.setTimeout(function () {
        document.querySelector('.scroll-delay-save').textContent = ''
      }, 2500)
    })
  })
})()

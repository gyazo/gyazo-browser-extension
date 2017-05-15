import storage from '../../libs/storageSwitcher'

let selector = document.getElementById('selector')
let delaySelector = document.getElementById('delay')
let contextMenuSetting = document.getElementById('contextMenuSetting')

storage.get({behavior: 'element', delay: 1, contextMenu: true})
  .then((item) => {
    selector.value = item.behavior
    delaySelector.value = item.delay
    contextMenuSetting.checked = item.contextMenu
  })
document.getElementById('element').textContent = chrome.i18n.getMessage('selectElement')
document.getElementById('area').textContent = chrome.i18n.getMessage('selectArea')
document.getElementById('contextMenuSettingMessage').textContent = chrome.i18n.getMessage('contextMenuSetting')
contextMenuSetting.addEventListener('change', (event) => {
  storage.set({contextMenu: event.target.checked})
})

selector.addEventListener('change', function (event) {
  storage.set({behavior: event.target.value})
    .then(() => {
      document.querySelector('.selector-save').textContent = 'Saved'
      window.setTimeout(function () {
        document.querySelector('.selector-save').textContent = ''
      }, 2500)
    })
})

delaySelector.addEventListener('change', function (event) {
  storage.set({delay: event.target.value})
    .then(() => {
      document.querySelector('.scroll-delay-save').textContent = 'Saved'
      window.setTimeout(function () {
        document.querySelector('.scroll-delay-save').textContent = ''
      }, 2500)
    })
})

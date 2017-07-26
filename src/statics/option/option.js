import storage from '../../libs/storageSwitcher'

const DELAY_WORDING = ['Short', 'Normal', 'Long']

let selector = document.getElementById('selector')
let fileSizeLimit = document.getElementById('fileSizeLimit')
let fileSizeLimitCurrentSetting = document.getElementById('fileSizeLimitCurrentSetting')
let delaySelector = document.getElementById('delay')
let delayCurrentSetting = document.getElementById('delayCurrentSetting')
let contextMenuSetting = document.getElementById('contextMenuSetting')
let pasteSupportSetting = document.getElementById('pasteSupportSetting')

storage.get()
  .then((item) => {
    selector.value = item.behavior
    delaySelector.value = item.delay
    delayCurrentSetting.textContent = DELAY_WORDING[item.delay]
    pasteSupportSetting.checked = item.pasteSupport
    contextMenuSetting.checked = item.contextMenu
    fileSizeLimit.value = item.fileSizeLimit
    fileSizeLimitCurrentSetting.textContent = item.fileSizeLimit + ' MB'
  })
document.getElementById('element').textContent = chrome.i18n.getMessage('selectElement')
document.getElementById('area').textContent = chrome.i18n.getMessage('selectArea')
document.getElementById('contextMenuSettingMessage').textContent = chrome.i18n.getMessage('contextMenuSetting')
document.getElementById('pasteSupportSettingText').textContent = chrome.i18n.getMessage('pasteSupportSettingText')
document.getElementById('fileSizeLimitText').textContent = chrome.i18n.getMessage('fileSizeLimitText')

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

fileSizeLimit.addEventListener('change', function (event) {
  storage.set({fileSizeLimit: event.target.value})
    .then(() => {
      fileSizeLimitCurrentSetting.textContent = event.target.value + ' MB'
      document.querySelector('.file-size-limit-save-alert').textContent = 'Saved'
      window.setTimeout(function () {
        document.querySelector('.file-size-limit-save-alert').textContent = ''
      }, 2500)
    })
})

delaySelector.addEventListener('change', function (event) {
  storage.set({delay: event.target.value})
    .then(() => {
      delayCurrentSetting.textContent = DELAY_WORDING[event.target.value]
      document.querySelector('.scroll-delay-save').textContent = 'Saved'
      window.setTimeout(function () {
        document.querySelector('.scroll-delay-save').textContent = ''
      }, 2500)
    })
})

pasteSupportSetting.addEventListener('change', (event) => {
  storage.set({pasteSupport: pasteSupportSetting.checked})
})

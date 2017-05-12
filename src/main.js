import thenChrome from 'then-chrome'
import browserInfo from 'bowser'
import MessageListener from './libs/MessageListener'
import gyazoIt from './libs/gyazoIt'
import {disableButton} from './libs/changeTabEvents'
import gyazoCaptureWithSize from './libs/gyazoCaptureWithSize'
import './contextMenu'

const onMessageListener = new MessageListener('main')

chrome.browserAction.onClicked.addListener(async (tab) => {
  if (tab.url.match(/chrome\.google\.com\/webstore\//)) {
    window.alert(chrome.i18n.getMessage('welcomeMessage'))
    return disableButton(tab.id)
  }
  await thenChrome.tabs.insertCSS(tab.id, {
    file: '/menu.css'
  })
  if (chrome.runtime.lastError && chrome.runtime.lastError.message.match(/cannot be scripted/)) {
    window.alert('It is not allowed to use Gyazo extension in this page.')
    return disableButton(tab.id)
  }
  try {
    await thenChrome.tabs.sendMessage(tab.id, {target: 'content', action: 'insertMenu', tab: tab})
  } catch (e) {
    e.message.match(/Could not establish connection/) &&
    window.confirm(chrome.i18n.getMessage('confirmReload')) &&
    chrome.tabs.reload(tab.id)
  }
  chrome && chrome.runtime && chrome.runtime.lastError &&
  chrome.runtime.lastError.number !== -2147467259 &&
  !chrome.runtime.lastError.message.match(/message port closed/) &&
  window.confirm(chrome.i18n.getMessage('confirmReload')) &&
  chrome.tabs.reload(tab.id)
})

onMessageListener.add('gyazoGetImageBlob', (request, sender, sendResponse) => {
  const xhr = new window.XMLHttpRequest()
  xhr.open('GET', request.gyazoUrl + '/raw', true)
  xhr.responseType = 'arraybuffer'
  xhr.onload = () => {
    const blob = new window.Blob([xhr.response], {type: 'image/png'})
    sendResponse({imageBlobUrl: window.URL.createObjectURL(blob)})
  }
  xhr.send()
})

onMessageListener.add('gyazoSendRawImage', (request, sender, sendResponse) => {
  // XXX: Firefox WebExtension returns real size image
  if (browserInfo.firefox) request.data.s = 1
  let data = request.data
  gyazoIt(request.tab, data.srcUrl)
})

onMessageListener.add('gyazoCaptureWithSize', gyazoCaptureWithSize)

chrome.runtime.onMessage.addListener(onMessageListener.listen.bind(onMessageListener))

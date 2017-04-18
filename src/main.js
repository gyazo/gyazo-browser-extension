import $ from 'jquery'
import browserInfo from 'bowser'
import {trimImage, appendImageToCanvas} from './libs/canvasUtils'
import storage from './libs/storageSwitcher'
import MessageListener from './libs/MessageListener'
import postToGyazo from './libs/postToGyazo'

const DELAY_TIMES = [0, 200, 400, 700, 1000]
const onMessageListener = new MessageListener('main')

let waitForDelay = function (callback) {
  storage.get({delay: 1}, function (item) {
    let delay = DELAY_TIMES[item.delay]
    if (delay === 0) {
      window.requestAnimationFrame(callback)
    }
    window.setTimeout(callback, delay)
  })
}

function onClickHandler (info, tab) {
  chrome.tabs.insertCSS(tab.id, {
    file: '/menu.css'
  })
  const GyazoFuncs = {
    gyazoIt: function () {
      if (info.srcUrl.match(/^data:/)) {
        postToGyazo(tab.id, {
          imageData: info.srcUrl,
          title: tab.title,
          url: tab.url
        })
      } else {
        const xhr = $.ajaxSettings.xhr()
        xhr.open('GET', info.srcUrl, true)
        xhr.responseType = 'blob'
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            const blob = xhr.response
            const fileReader = new FileReader()
            fileReader.onload = function (e) {
              postToGyazo(tab.id, {
                imageData: fileReader.result,
                title: tab.title,
                url: tab.url
              })
            }
            fileReader.readAsDataURL(blob)
          }
        }
        xhr.send()
      }
    }
  }

  if (info.menuItemId in GyazoFuncs) {
    GyazoFuncs[info.menuItemId]()
  }
}

function disableButton (tabId) {
  chrome.browserAction.setIcon({
    path: {
      19: '/icons/19_disable.png',
      38: '/icons/19_disable@2x.png'
    }
  })
  chrome.browserAction.disable(tabId)
}

function enableButton (tabId) {
  chrome.browserAction.setIcon({
    path: {
      19: '/icons/19.png',
      38: '/icons/19@2x.png'
    }
  })
  chrome.browserAction.enable(tabId)
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (tab.status === 'loading') {
      return disableButton(tab.id)
    }
    if (tab.url.match(/^https?:/)) {
      enableButton(tab.id)
    } else {
      disableButton(tab.id)
    }
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status === 'loading') {
    disableButton(tabId)
  } else if (changeInfo.status === 'complete') {
    chrome.tabs.get(tabId, function (tab) {
      if (!tab.url.match(/^https?:/)) {
        return
      }
      chrome.tabs.executeScript(tab.id, {
        file: './content.js'
      }, function () {
        chrome.tabs.insertCSS(tab.id, {
          file: '/content.css'
        }, () => enableButton(tab.id))
      })
    })
  }
})

// XXX: Buggy contextMenus on Firefox < v49
if (browserInfo.chrome || (browserInfo.firefox && browserInfo.version >= 49) || browserInfo.msedge) {
  chrome.contextMenus.onClicked.addListener(onClickHandler)

  chrome.contextMenus.create({
    title: chrome.i18n.getMessage('contextMenuImage'),
    id: 'gyazoIt',
    contexts: ['image']
  })
}

chrome.browserAction.onClicked.addListener(function (tab) {
  if (tab.url.match(/chrome\.google\.com\/webstore\//)) {
    window.alert(chrome.i18n.getMessage('welcomeMessage'))
    return disableButton(tab.id)
  }
  chrome.tabs.insertCSS(tab.id, {
    file: '/menu.css'
  }, function () {
    if (chrome.runtime.lastError && chrome.runtime.lastError.message.match(/cannot be scripted/)) {
      window.alert('It is not allowed to use Gyazo extension in this page.')
      return disableButton(tab.id)
    }
    chrome.tabs.sendMessage(tab.id, {action: 'insertMenu', tab: tab}, function () {
      chrome && chrome.runtime && chrome.runtime.lastError &&
      chrome.runtime.lastError.number !== -2147467259 &&
      !chrome.runtime.lastError.message.match(/message port closed/) &&
      window.confirm(chrome.i18n.getMessage('confirmReload')) &&
      chrome.tabs.reload(tab.id)
    })
  })
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
  onClickHandler({
    menuItemId: 'gyazoIt',
    srcUrl: data.srcUrl
  }, request.tab)
})

onMessageListener.add('gyazoCaptureWithSize', (request, sender, sendResponse) => {
  // XXX: Firefox WebExtension returns real size image
  if (browserInfo.firefox) request.data.s = 1
  const c = document.createElement('canvas')
  c.height = request.data.h
  c.width = request.data.w * request.data.z * request.data.s
  let canvasData = c.toDataURL()
  const capture = function (scrollHeight, lastImageBottom, lastImageData) {
    const imagePositionTop = lastImageBottom || scrollHeight * request.data.z * request.data.s
    const offsetTop = request.data.y - request.data.positionY
    if (scrollHeight === 0 && offsetTop >= 0 && offsetTop + request.data.h <= request.data.innerHeight) {
      // Capture in window (not require scroll)
      chrome.tabs.captureVisibleTab(null, {format: 'png'}, function (data) {
        if (lastImageData === data) {
          // retry
          return capture(scrollHeight, lastImageBottom, data)
        }
        trimImage({
          imageData: data,
          scale: request.data.s,
          zoom: request.data.z,
          startX: request.data.x - request.data.positionX,
          startY: offsetTop,
          width: request.data.w,
          height: Math.min(request.data.innerHeight, request.data.h - scrollHeight),
          callback: function (_canvas) {
            appendImageToCanvas({
              canvasData: canvasData,
              imageSrc: _canvas.toDataURL(),
              pageHeight: request.data.h,
              imageHeight: Math.min(request.data.innerHeight, request.data.h - scrollHeight),
              width: request.data.w,
              top: 0,
              scale: request.data.s,
              zoom: request.data.z,
              callback: function (_canvas) {
                canvasData = _canvas.toDataURL()
                scrollHeight += request.data.innerHeight
                capture(scrollHeight)
              }
            })
          }
        })
      })
      return true
    }
    if (scrollHeight >= request.data.h) {
      chrome.tabs.executeScript(request.tab.id, {
        code: 'window.scrollTo(' + request.data.positionX + ', ' + request.data.positionY + ' )'
      })
      postToGyazo(request.tab.id, {
        imageData: canvasData,
        title: request.data.t,
        url: request.data.u,
        width: request.data.w,
        height: request.data.h,
        scale: request.data.s,
        desc: request.data.desc
      })
      return sendResponse()
    }
    chrome.tabs.executeScript(request.tab.id, {
      code: 'window.scrollTo(' + request.data.positionX + ', ' + (scrollHeight + request.data.y) + ' )'
    }, function () {
      chrome.tabs.sendMessage(request.tab.id, {
        action: 'changeFixedElementToAbsolute',
        scrollTo: {x: request.data.positionX, y: scrollHeight + request.data.y}
      }, function (message) {
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, function (data) {
          if (lastImageData === data) {
            // retry
            return capture(scrollHeight, lastImageBottom, data)
          }
          trimImage({
            imageData: data,
            scale: request.data.s,
            zoom: request.data.z,
            startX: request.data.x - request.data.positionX,
            startY: 0,
            width: request.data.w,
            height: Math.min(request.data.innerHeight, request.data.h - scrollHeight),
            callback: function (_canvas) {
              appendImageToCanvas({
                canvasData: canvasData,
                imageSrc: _canvas.toDataURL(),
                pageHeight: request.data.h,
                imageHeight: Math.min(request.data.innerHeight, request.data.h - scrollHeight),
                width: request.data.w,
                top: imagePositionTop,
                scale: request.data.s,
                zoom: request.data.z,
                callback: function (_canvas, lastImageBottom) {
                  canvasData = _canvas.toDataURL()
                  scrollHeight += request.data.innerHeight
                  waitForDelay(function () {
                    capture(scrollHeight, lastImageBottom, data)
                  })
                }
              })
            }
          })
        })
      })
    })
  }
  capture(0)
})

chrome.runtime.onMessage.addListener(onMessageListener.listen.bind(onMessageListener))

import thenChrome from 'then-chrome'

const disableButton = function (tabId) {
  chrome.browserAction.setIcon({
    path: {
      19: '/icons/19_disable.png',
      38: '/icons/19_disable@2x.png'
    }
  })
  chrome.browserAction.disable(tabId)
}

const enableButton = function (tabId) {
  chrome.browserAction.setIcon({
    path: {
      19: '/icons/19.png',
      38: '/icons/19@2x.png'
    }
  })
  chrome.browserAction.enable(tabId)
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  thenChrome.tabs.get(activeInfo.tabId)
  .then((tab) => {
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
    thenChrome.tabs.get(tabId)
    .then((tab) => {
      if (!tab.url.match(/^https?:/)) {
        return Promise.reject()
      }
      return thenChrome.tabs.executeScript(tabId, {
        file: './content.js'
      })
    })
    .then(() => {
      return thenChrome.tabs.insertCSS(tabId, {
        file: '/content.css'
      })
    })
    .then(() => enableButton(tabId))
  }
})

export {enableButton, disableButton}

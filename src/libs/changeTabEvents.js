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

export {enableButton, disableButton}

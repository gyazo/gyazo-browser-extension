import thenChrome from 'then-chrome'
import browserInfo from 'bowser'

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

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await thenChrome.tabs.get(activeInfo.tabId)
  if (tab.status === 'loading') {
    return disableButton(tab.id)
  }
  if (tab.url.match(/^https?:/)) {
    enableButton(tab.id)
  } else {
    disableButton(tab.id)
  }
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    disableButton(tabId)
  } else if (changeInfo.status === 'complete') {
    const tab = await thenChrome.tabs.get(tabId)
    if (!tab.url.match(/^https?:/)) {
      throw new Error('This Extension can run only on https? pages: ' + location.href)
    }
    let loaded = [false]
    try {
      loaded = (await thenChrome.tabs.executeScript(tabId, {
        code: 'window.__embededGyazoContentJS'
      }))
    } catch (e) {}
    if (loaded[0]) return enableButton(tabId)
    try {
      await thenChrome.tabs.executeScript(tabId, {
        file: './content.js'
      })
    } catch (e) {
      if (browserInfo.msedge && e.number === -2147467259) return
      throw e
    }
    await thenChrome.tabs.insertCSS(tabId, {
      file: '/content.css'
    })
    enableButton(tabId)
  }
})

export {enableButton, disableButton}

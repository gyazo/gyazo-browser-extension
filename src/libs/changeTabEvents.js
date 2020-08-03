import thenChrome from 'then-chrome';

const disableButton = function (tabId) {
  chrome.browserAction.setIcon({
    path: {
      19: '/icons/19_disable.png',
      38: '/icons/19_disable@2x.png',
    },
  });
  chrome.browserAction.disable(tabId);
};

const enableButton = function (tabId) {
  chrome.browserAction.setIcon({
    path: {
      19: '/icons/19.png',
      38: '/icons/19@2x.png',
    },
  });
  chrome.browserAction.enable(tabId);
};

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await thenChrome.tabs.get(activeInfo.tabId);
  if (tab.status === 'loading') {
    return disableButton(tab.id);
  }
  enableButton(tab.id);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    disableButton(tabId);
  } else if (changeInfo.status === 'complete') {
    enableButton(tabId);
  }
  return true;
});

export { enableButton, disableButton };

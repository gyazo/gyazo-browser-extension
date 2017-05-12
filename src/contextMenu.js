import thenChrome from 'then-chrome'
import MessageListener from './libs/MessageListener'
import gyazoIt from './libs/gyazoIt'

const onContextMenuClickListener = new MessageListener('contextmenu')

chrome.contextMenus.create({
  title: chrome.i18n.getMessage('contextMenuImage'),
  id: 'gyazoIt',
  contexts: ['image']
})
chrome.contextMenus.create({
  title: 'Capture',
  id: 'captureParent'
})
chrome.contextMenus.create({
  parentId: 'captureParent',
  id: 'captureSelectElement',
  title: chrome.i18n.getMessage('selectElement')
})
chrome.contextMenus.create({
  parentId: 'captureParent',
  id: 'captureSelectArea',
  title: chrome.i18n.getMessage('selectArea')
})
chrome.contextMenus.create({
  parentId: 'captureParent',
  id: 'captureWindow',
  title: chrome.i18n.getMessage('captureWindow')
})
chrome.contextMenus.create({
  parentId: 'captureParent',
  id: 'captureWholePage',
  title: chrome.i18n.getMessage('topToBottom')
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.insertCSS(tab.id, {
    file: '/menu.css'
  })
  onContextMenuClickListener.listen({
    target: 'contextmenu',
    action: info.menuItemId,
    info,
    tab
  })
})

onContextMenuClickListener.add('gyazoIt', ({info, tab}) => {
  gyazoIt(tab, info.srcUrl)
})

onContextMenuClickListener.add('captureSelectElement', ({info, tab}) => {
  chrome.tabs.sendMessage(tab.id, {
    target: 'content',
    action: 'captureElement',
    tab
  })
})

onContextMenuClickListener.add('captureWindow', ({info, tab}) => {
  chrome.tabs.sendMessage(tab.id, {
    target: 'content',
    action: 'captureWindow',
    tab
  })
})

onContextMenuClickListener.add('captureSelectArea', ({info, tab}) => {
  chrome.tabs.sendMessage(tab.id, {
    target: 'content',
    action: 'captureSelectArea',
    tab
  })
})

onContextMenuClickListener.add('captureWholePage', ({info, tab}) => {
  chrome.tabs.sendMessage(tab.id, {
    target: 'content',
    action: 'captureWholePage',
    tab
  })
})

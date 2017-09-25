import thenChrome from 'then-chrome'

export const launchGyazo = () => {
  chrome.runtime.sendMessage(chrome.runtime.id, {
    target: 'main',
    action: 'launchGyazo'
  }, function () {})
}
export const launchGyazoGif = () => {
  chrome.runtime.sendMessage(chrome.runtime.id, {
    target: 'main',
    action: 'launchGyazoGif'
  }, function () {})
}

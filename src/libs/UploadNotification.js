import browserInfo from 'bowser'

export default class UploadNotification {
  constructor (tabId) {
    this.tabId = tabId
  }
  update (option) {
    option.target = 'content'
    option.action = 'notification'
    chrome.tabs.sendMessage(this.tabId, option)
  }
  finish (imagePageUrl, imageDataUrl, scale) {
    this.update({
      title: chrome.i18n.getMessage('uploadingFinishTitle'),
      message: browserInfo.firefox ? '' : chrome.i18n.getMessage('uploadingFinishMessage'),
      imagePageUrl,
      imageUrl: imageDataUrl,
      scale,
      isFinish: true
    })
  }
}

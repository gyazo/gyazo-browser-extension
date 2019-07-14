import test from 'ava'
import UploadNotification from '../../src/libs/UploadNotification'
import {I18nPlugin} from 'sinon-chrome/plugins'

chrome.registerPlugin(new I18nPlugin({
  uploadingFinishTitle: {message: 'finish-title'},
  uploadingFinishMessage: {message: 'finish-message'}
}))

let notification = new UploadNotification(100)

test.beforeEach(() => {
  chrome.tabs.sendMessage.flush()
})

test('should sendMessage to content on update', async (t) => {
  t.plan(1)
  notification.update({title: 'test'})
  t.truthy(chrome.tabs.sendMessage.withArgs(100, {target: 'content', action: 'notification', title: 'test'}).calledOnce)
})

test('should sendMessage with correct args on finish', async (t) => {
  t.plan(1)
  const imagePageUrl = 'https://test/test.html'
  const imageDataUrl = 'data: aaaa'
  const scale = 2
  notification.finish(imagePageUrl, imageDataUrl, scale)
  t.truthy(chrome.tabs.sendMessage.withArgs(100, {
    target: 'content',
    action: 'notification',
    imagePageUrl,
    imageUrl: imageDataUrl,
    scale,
    isFinish: true,
    title: 'finish-title',
    message: 'finish-message'
  }).calledOnce)
})

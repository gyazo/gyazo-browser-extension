import browserInfo from 'bowser'
import MessageListener from '../libs/MessageListener'
import expander from './expander'
import notification from './notification'
import insertMenu from './insertMenu'
import {changeFixedElementToAbsolute} from './actions'

(function () {
  if (window.__embededGyazoContentJS) {
    return
  }
  window.__embededGyazoContentJS = true
  const onMessageListener = new MessageListener('content')

  if (/gyazo\.com/.test(location.hostname)) {
    document.documentElement.setAttribute('data-extension-installed', true)
  }

  onMessageListener.add('notification', notification)
  onMessageListener.add('insertMenu', insertMenu)
  onMessageListener.add('changeFixedElementToAbsolute', changeFixedElementToAbsolute)

  chrome.runtime.onMessage.addListener(onMessageListener.listen.bind(onMessageListener))
  if (
    !browserInfo.firefox && // XXX: Firefox can't embed moz-extension:// file in content
    !(/^(.+\.)?gyazo\.com$/).test(window.location.host)  // Prevent showing preview on gyazo.com
  ) expander()
})()

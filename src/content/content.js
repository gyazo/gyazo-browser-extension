import browserInfo from 'bowser';
import MessageListener from '../libs/MessageListener';
import expander from './expander';
import notification from './notification';
import insertMenu from './insertMenu';
import {
  gyazocaptureWindow,
  gyazoCaptureSelectedArea,
  gyazoSelectElm,
  gyazoWholeCapture,
  changeFixedElementToAbsolute,
  waitScroll,
} from './actions';

(function () {
  if (window.__embededGyazoContentJS) {
    return;
  }
  window.__embededGyazoContentJS = true;
  const onMessageListener = new MessageListener('content');

  if (/gyazo\.com/.test(location.hostname)) {
    document.documentElement.setAttribute('data-extension-installed', true);
  }

  onMessageListener.add('notification', notification);
  onMessageListener.add('insertMenu', insertMenu);
  onMessageListener.add(
    'changeFixedElementToAbsolute',
    changeFixedElementToAbsolute
  );
  onMessageListener.add('captureWindow', gyazocaptureWindow);
  onMessageListener.add('captureSelectArea', gyazoCaptureSelectedArea);
  onMessageListener.add('captureElement', gyazoSelectElm);
  onMessageListener.add('captureWholePage', gyazoWholeCapture);
  onMessageListener.add('waitScroll', waitScroll);

  chrome.runtime.onMessage.addListener(
    onMessageListener.listen.bind(onMessageListener)
  );
  if (
    !browserInfo.firefox && // XXX: Firefox can't embed moz-extension:// file in content
    !/^(.+\.)?gyazo\.com$/.test(window.location.host) // Prevent showing preview on gyazo.com
  )
    expander();
})();

import thenChrome from 'then-chrome';
import createButton from './createButtonOnMenu';
import storage from '../libs/storageSwitcher';
import {
  gyazocaptureWindow,
  gyazoCaptureSelectedArea,
  gyazoSelectElm,
  gyazoWholeCapture,
} from './actions';
import { ESC_KEY_CODE } from '../constants';

const REMOVE_GYAZOMENU_EVENT = new window.Event('removeGyazoMenu');

export default async (request, sender, sendResponse) => {
  let capturesPageUrl = 'https://gyazo.com/';
  if (process.env.BUILD_EXTENSION_TYPE === 'teams') {
    const { error, team } = await thenChrome.runtime.sendMessage(
      chrome.runtime.id,
      {
        target: 'main',
        action: 'getTeam',
      }
    );
    if (error) {
      if (error.status === 403) {
        window.alert(error.message);
        window.open('https://gyazo.com/teams/login');
      }
      return;
    }
    const teamName = team.name;
    if (!teamName) return;
    capturesPageUrl = `https://${teamName}.gyazo.com`;
  }
  let gyazoMenu = document.querySelector(
    '.gyazo-menu:not(.gyazo-notification)'
  );
  if (gyazoMenu) {
    document.body.removeChild(gyazoMenu);
    window.dispatchEvent(REMOVE_GYAZOMENU_EVENT);
  }

  const hideMenu = () => {
    if (document.body.contains(gyazoMenu)) {
      document.body.removeChild(gyazoMenu);
    }
    window.dispatchEvent(REMOVE_GYAZOMENU_EVENT);
  };

  gyazoMenu = document.createElement('div');
  gyazoMenu.className = 'gyazo-menu gyazo-menu-element';

  let selectElementBtn = createButton(
    'selection',
    chrome.i18n.getMessage('selectElement'),
    'E'
  );
  let selectAreaBtn = createButton(
    'crop',
    chrome.i18n.getMessage('selectArea'),
    'S'
  );
  let windowCaptureBtn = createButton(
    'window',
    chrome.i18n.getMessage('captureWindow'),
    'P'
  );
  let wholeCaptureBtn = createButton(
    'window-scroll',
    chrome.i18n.getMessage('topToBottom'),
    'W'
  );
  let myImageBtn = createButton('grid', chrome.i18n.getMessage('myImage'));
  myImageBtn.classList.add('gyazo-menu-myimage');
  let closeBtn = document.createElement('div');
  closeBtn.className = 'gyazo-close-button gyazo-menu-element';
  const closeBtnIcon = document.createElement('div');
  closeBtnIcon.className = 'gyazo-menu-element gyazo-icon gyazo-icon-cross';
  closeBtn.appendChild(closeBtnIcon);
  try {
    window
      .fetch(chrome.runtime.getURL('imgs/cross.svg'))
      .then((res) => res.text())
      .then((text) => {
        closeBtnIcon.innerHTML = text;
      });
  } catch (e) {
    closeBtnIcon.innerHTML = `<img src='${chrome.runtime.getURL(
      'imgs/cross.svg'
    )}' class='gyazo-menu-element' />`;
  }
  closeBtn.setAttribute('title', 'Press: Escape');

  window.addEventListener('contextmenu', function () {
    hideMenu();
  });
  document.body.appendChild(gyazoMenu);
  gyazoMenu.appendChild(selectElementBtn);
  gyazoMenu.appendChild(selectAreaBtn);
  gyazoMenu.appendChild(windowCaptureBtn);
  gyazoMenu.appendChild(wholeCaptureBtn);
  gyazoMenu.appendChild(myImageBtn);
  gyazoMenu.appendChild(closeBtn);

  let hotKey = function (event) {
    window.removeEventListener('keydown', hotKey);
    if (event.keyCode === ESC_KEY_CODE) {
      hideMenu();
    }
    switch (String.fromCharCode(event.keyCode)) {
      case 'E':
        selectElementBtn.click();
        break;
      case 'S':
        selectAreaBtn.click();
        break;
      case 'P':
        windowCaptureBtn.click();
        break;
      case 'W':
        wholeCaptureBtn.click();
        break;
    }
  };
  window.addEventListener('keydown', hotKey);
  let settings = { behavior: 'element' };
  try {
    settings = await storage.get({ behavior: 'element' });
  } catch {
    // no-op
  }
  const { behavior } = settings;
  if (behavior === 'element') {
    // Default behavior is select element
    selectElementBtn.classList.add('gyazo-button-active');
    window.requestAnimationFrame(() =>
      gyazoSelectElm(request, sender, sendResponse)
    );
  } else if (behavior === 'area') {
    // Default behavior is select area
    selectAreaBtn.classList.add('gyazo-button-active');
    gyazoCaptureSelectedArea(request, sender, sendResponse);
  }
  selectAreaBtn.addEventListener('click', function () {
    if (behavior === 'area') return;
    hideMenu();
    window.requestAnimationFrame(function () {
      gyazoCaptureSelectedArea(request, sender, sendResponse);
    });
  });
  selectElementBtn.addEventListener('click', function () {
    if (behavior === 'element') return;
    hideMenu();
    window.requestAnimationFrame(function () {
      gyazoSelectElm(request, sender, sendResponse);
    });
  });
  windowCaptureBtn.addEventListener('click', function () {
    hideMenu();
    window.requestAnimationFrame(function () {
      gyazocaptureWindow(request, sender, sendResponse);
    });
  });
  wholeCaptureBtn.addEventListener('click', function () {
    hideMenu();
    window.requestAnimationFrame(function () {
      gyazoWholeCapture(request, sender, sendResponse);
    });
  });
  closeBtn.addEventListener('click', function () {
    hideMenu();
  });
  myImageBtn.addEventListener('click', function () {
    hideMenu();
    window.open(capturesPageUrl);
  });
};

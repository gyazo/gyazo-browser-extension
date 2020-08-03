import thenChrome from 'then-chrome';
import isPressCommandKey from '../../libs/isPressCommandKey';
import getZoomAndScale from '../../libs/getZoomAndScale';
import changeFixedElementToAbsolute from '../../libs/changeFixedElementToAbsolute';
import restoreFixedElement from '../../libs/restoreFixedElement';
import JackupElement from '../../libs/jackupElement';
import { lockScroll, unlockScroll, packScrollBar } from '../../libs/scroll';
import { width as pageWidth } from '../../libs/pageScrollSize';
import { ESC_KEY_CODE } from '../../constants';

export default async (request) => {
  if (document.querySelector('.gyazo-crop-select-element')) {
    return false;
  }
  const MARGIN = 3;
  document.body.classList.add('gyazo-select-element-mode');
  const jackup = new JackupElement();
  const layer = document.createElement('div');
  layer.className = 'gyazo-crop-select-element';
  document.body.appendChild(layer);
  layer.style.background = 'rgba(9, 132, 222, 0.35)';
  layer.style.margin = '0px';
  layer.style.border = '1px solid rgb(9, 132, 222)';
  layer.style.position = 'fixed';
  layer.style.pointerEvents = 'none';
  layer.style.zIndex = 2147483646; // Maximun number of 32bit Int - 1
  const allElms = Array.from(document.body.querySelectorAll('*')).filter(
    function (item) {
      return (
        !item.classList.contains('gyazo-crop-select-element') &&
        !item.classList.contains('gyazo-menu-element')
      );
    }
  );
  allElms.forEach(function (item) {
    item.classList.add('gyazo-select-element-cursor-overwrite');
  });
  const moveLayer = function (event) {
    const item = event.target;
    event.stopPropagation();
    if (item.tagName === 'IMG') {
      layer.setAttribute('data-img-url', item.src);
    } else {
      layer.setAttribute('data-img-url', '');
    }
    const rect = item.getBoundingClientRect();
    layer.style.width = rect.width + 'px';
    layer.style.height = rect.height + 'px';
    layer.style.left = rect.left + 'px';
    layer.style.top = rect.top + 'px';
  };
  let hasMargin = false;
  const takeMargin = function () {
    if (hasMargin) return;
    hasMargin = true;
    layer.style.width =
      parseInt(window.getComputedStyle(layer).width, 10) + MARGIN * 2 + 'px';
    layer.style.height =
      parseInt(window.getComputedStyle(layer).height, 10) + MARGIN * 2 + 'px';
    layer.style.left =
      parseInt(window.getComputedStyle(layer).left, 10) - MARGIN + 'px';
    layer.style.top =
      parseInt(window.getComputedStyle(layer).top, 10) - MARGIN + 'px';
  };
  const keydownHandler = function (event) {
    if (event.keyCode === ESC_KEY_CODE) {
      cancel();
    } else if (isPressCommandKey(event)) {
      takeMargin();
    }
  };
  const keyUpHandler = function (event) {
    if (isPressCommandKey(event)) {
      hasMargin = false;
      layer.style.width =
        parseInt(window.getComputedStyle(layer).width, 10) - MARGIN * 2 + 'px';
      layer.style.height =
        parseInt(window.getComputedStyle(layer).height, 10) - MARGIN * 2 + 'px';
      layer.style.left =
        parseInt(window.getComputedStyle(layer).left, 10) + MARGIN + 'px';
      layer.style.top =
        parseInt(window.getComputedStyle(layer).top, 10) + MARGIN + 'px';
    }
  };
  const clickElement = function (event) {
    event.stopPropagation();
    event.preventDefault();
    layer.style.opacity = 0;
    document.body.classList.remove('gyazo-select-element-mode');
    allElms.forEach(function (item) {
      if (item.classList.contains('gyazo-select-element-cursor-overwrite')) {
        item.classList.remove('gyazo-select-element-cursor-overwrite');
      }
      item.removeEventListener('mouseover', moveLayer);
      item.removeEventListener('click', clickElement);
    });
    const data = {};
    const scaleObj = getZoomAndScale();

    // Sanitize gyazo desc for ivy-search
    Array.from(document.querySelectorAll('*')).forEach(function (elm) {
      if (
        window.getComputedStyle(elm).display === 'none' ||
        window.getComputedStyle(elm).visibility === 'hidden'
      ) {
        elm.classList.add('gyazo-hidden');
      }
    });
    const dupTarget = event.target.cloneNode(true);
    Array.from(dupTarget.querySelectorAll('*')).forEach(function (elm) {
      switch (elm.tagName) {
        case 'SCRIPT':
        case 'STYLE':
          return elm.remove();
      }
      if (elm.classList.contains('gyazo-hidden')) {
        elm.remove();
      }
    });
    Array.from(document.getElementsByClassName('gyazo-hidden')).forEach(
      function (elm) {
        elm.classList.remove('gyazo-hidden');
      }
    );

    data.w = parseFloat(layer.style.width);
    data.h = parseFloat(layer.style.height);
    data.x = window.scrollX + layer.offsetLeft;
    data.y = window.scrollY + layer.offsetTop;
    data.t = document.title;
    data.u = location.href;
    data.s = scaleObj.scale;
    data.z = scaleObj.zoom;
    data.documentWidth = pageWidth();
    data.positionX = window.scrollX;
    data.positionY = window.scrollY;
    data.desc = dupTarget.textContent;
    if (document.body.contains(layer)) {
      document.body.removeChild(layer);
    }
    if (document.querySelector('.gyazo-menu')) {
      document.body.removeChild(document.querySelector('.gyazo-menu'));
    }
    jackup.height = window.innerHeight;
    window.removeEventListener('contextmenu', cancel);
    window.removeEventListener('keydown', keydownHandler);
    document.removeEventListener('keyup', keyUpHandler);
    if (
      layer.offsetTop >= 0 &&
      layer.offsetTop + layer.offsetHeight <= window.innerHeight
    ) {
      // Only when required scroll
      changeFixedElementToAbsolute();
    }
    if (layer.getAttribute('data-img-url')) {
      restoreFixedElement();
      return chrome.runtime.sendMessage(
        chrome.runtime.id,
        {
          target: 'main',
          action: 'gyazoSendRawImage',
          data: { srcUrl: layer.getAttribute('data-img-url') },
          tab: Object.assign(
            { width: window.innerWidth, height: window.innerHeight },
            request.tab
          ),
        },
        function () {}
      );
    }
    let overflow = {};
    if (data.y + data.h > window.innerHeight + data.positionY) {
      overflow = lockScroll();
      packScrollBar(overflow);
    }
    const finish = function () {
      if (
        document.getElementsByClassName('gyazo-crop-select-element').length > 0
      ) {
        return window.requestAnimationFrame(finish);
      }
      window.requestAnimationFrame(async () => {
        await thenChrome.runtime.sendMessage(chrome.runtime.id, {
          target: 'main',
          action: 'gyazoCaptureWithSize',
          data: data,
          tab: Object.assign(
            { width: window.innerWidth, height: window.innerHeight },
            request.tab
          ),
        });
        restoreFixedElement();
        if (document.body.contains(jackup.element)) jackup.remove();
        unlockScroll(overflow);
      });
    };
    window.requestAnimationFrame(finish);
  };
  const cancel = function () {
    if (document.body.contains(jackup.element)) {
      jackup.remove();
    }
    if (document.body.contains(layer)) {
      document.body.removeChild(layer);
    }
    document.body.classList.remove('gyazo-select-element-mode');
    window.removeEventListener('contextmenu', cancel);
    document.removeEventListener('keydown', keydownHandler);
    document.removeEventListener('keyup', keyUpHandler);
    Array.from(
      document.querySelectorAll('.gyazo-select-element-cursor-overwrite')
    ).forEach(function (item) {
      item.classList.remove('gyazo-select-element-cursor-overwrite');
      item.removeEventListener('mouseover', moveLayer);
      item.removeEventListener('click', clickElement);
    });
    restoreFixedElement();
  };
  let removedGyazoMenu = function () {
    window.removeEventListener('removeGyazoMenu', removedGyazoMenu);
    cancel();
  };
  window.addEventListener('removeGyazoMenu', removedGyazoMenu);
  window.addEventListener('contextmenu', cancel);
  document.addEventListener('keydown', keydownHandler);
  document.addEventListener('keyup', keyUpHandler);
  window.requestAnimationFrame(function () {
    allElms.forEach(function (item) {
      item.addEventListener('mouseover', moveLayer);
      item.addEventListener('click', clickElement);
    });
  });
};

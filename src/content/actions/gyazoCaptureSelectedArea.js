import restoreFixedElement from '../../libs/restoreFixedElement';
import getZoomAndScale from '../../libs/getZoomAndScale';
import { lockScroll, unlockScroll, packScrollBar } from '../../libs/scroll';
import {
  height as pageHeight,
  width as pageWidth,
} from '../../libs/pageScrollSize';
import JackupElement from '../../libs/jackupElement';
import { ESC_KEY_CODE } from '../../constants';

export default (request) => {
  if (document.querySelector('.gyazo-jackup-element')) {
    return false;
  }
  let startX, startY;
  let data = {};
  const tempUserSelect = document.body.style.webkitUserSelect;
  const layer = document.createElement('div');
  const jackup = new JackupElement();
  layer.style.position = 'absolute';
  layer.style.left = document.body.clientLeft + 'px';
  layer.style.top = document.body.clientTop + 'px';
  layer.style.width = pageWidth() + 'px';
  layer.style.height = pageHeight() + 'px';
  layer.style.zIndex = 2147483646; // Maximun number of 32bit Int - 1
  layer.style.cursor = 'crosshair';
  layer.className = 'gyazo-select-layer';
  document.body.style.webkitUserSelect = 'none';
  const selectionElm = document.createElement('div');
  layer.appendChild(selectionElm);
  document.body.appendChild(layer);
  selectionElm.styleUpdate = function (styles) {
    Object.keys(styles).forEach(function (key) {
      selectionElm.style[key] = styles[key];
    });
  };
  selectionElm.styleUpdate({
    background: 'rgba(92, 92, 92, 0.3)',
    position: 'fixed',
  });
  const cancelGyazo = function () {
    if (!(layer.parentNode && jackup.element.parentNode)) return;
    document.body.removeChild(layer);
    jackup.remove();
    document.body.style.webkitUserSelect = tempUserSelect;
    document.removeEventListener('keydown', keydownHandler);
    window.removeEventListener('contextmenu', cancelGyazo);
    restoreFixedElement();
    if (document.querySelector('.gyazo-menu')) {
      document.body.removeChild(document.querySelector('.gyazo-menu'));
    }
  };
  let removedGyazoMenu = function () {
    cancelGyazo();
    window.removeEventListener('removeGyazoMenu', removedGyazoMenu);
  };
  window.addEventListener('removeGyazoMenu', removedGyazoMenu);
  const keydownHandler = function (event) {
    if (event.keyCode === ESC_KEY_CODE) {
      //  If press Esc Key, cancel it
      cancelGyazo();
    }
  };
  const mousedownHandler = function (e) {
    let gyazoMenu = document.querySelector('.gyazo-menu');
    if (gyazoMenu) {
      document.body.removeChild(gyazoMenu);
    }
    startX = e.pageX;
    startY = e.pageY;
    selectionElm.styleUpdate({
      border: '1px solid rgba(255, 255, 255, 0.8)',
      left: startX + 'px',
      top: startY + 'px',
    });
    layer.removeEventListener('mousedown', mousedownHandler);
    layer.addEventListener('mousemove', mousemoveHandler);
    layer.addEventListener('mouseup', mouseupHandler);
  };
  const mousemoveHandler = function (e) {
    selectionElm.styleUpdate({
      width: Math.abs(e.pageX - startX) - 1 + 'px',
      height: Math.abs(e.pageY - startY) - 1 + 'px',
      left: Math.min(e.pageX, startX) + 'px',
      top: Math.min(e.pageY, startY) - window.scrollY + 'px',
    });
  };
  const mouseupHandler = function () {
    document.body.style.webkitUserSelect = tempUserSelect;
    document.removeEventListener('keydown', keydownHandler);
    window.addEventListener('contextmenu', function (event) {
      cancelGyazo();
      event.preventDefault();
    });
    const scaleObj = getZoomAndScale();
    const rect = selectionElm.getBoundingClientRect();
    data.w = rect.width;
    data.h = rect.height;
    if (data.h <= 3 || data.w <= 3) {
      cancelGyazo();
      return false;
    }
    layer.style.opacity = 0;
    data.x = rect.left + window.scrollX;
    data.y = rect.top + window.scrollY;
    data.t = document.title;
    data.u = location.href;
    data.s = scaleObj.scale;
    data.z = scaleObj.zoom;
    data.documentWidth = pageWidth();
    data.positionX = window.scrollX;
    data.positionY = window.scrollY;
    document.body.removeChild(layer);
    if (document.querySelector('.gyazo-menu')) {
      document.body.removeChild(document.querySelector('.gyazo-menu'));
    }
    let overflow = {};
    if (data.h > window.innerHeight) {
      overflow = lockScroll();
      packScrollBar(overflow);
    }
    jackup.height = window.innerHeight;
    // wait for rewrite by removeChild
    let finish = function () {
      if (document.getElementsByClassName('gyazo-select-layer').length > 0) {
        return window.requestAnimationFrame(finish);
      }
      window.setTimeout(function () {
        chrome.runtime.sendMessage(
          chrome.runtime.id,
          {
            target: 'main',
            action: 'gyazoCaptureWithSize',
            data: data,
            tab: Object.assign(
              { width: window.innerWidth, height: window.innerHeight },
              request.tab
            ),
          },
          function () {
            jackup.remove();
            unlockScroll(overflow);
            restoreFixedElement();
          }
        );
      }, 100);
    };
    window.requestAnimationFrame(finish);
  };
  layer.addEventListener('mousedown', mousedownHandler);
  document.addEventListener('keydown', keydownHandler);
  window.addEventListener('contextmenu', cancelGyazo);
};

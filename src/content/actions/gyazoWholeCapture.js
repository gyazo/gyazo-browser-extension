import thenChrome from 'then-chrome';
import getZoomAndScale from '../../libs/getZoomAndScale';
import JackupElement from '../../libs/jackupElement';
import { lockScroll, unlockScroll } from '../../libs/scroll';
import {
  width as pageWidth,
  height as pageHeight,
} from '../../libs/pageScrollSize';

export default async (request) => {
  const overflow = lockScroll();
  const data = {};
  const scaleObj = getZoomAndScale();
  data.w = pageWidth();
  data.h = pageHeight();
  data.x = 0;
  data.documentWidth = pageWidth();
  data.y = 0;
  data.t = document.title;
  data.u = location.href;
  data.s = scaleObj.scale;
  data.z = scaleObj.zoom;
  data.positionX = window.scrollX;
  data.positionY = window.scrollY;
  const jackup = new JackupElement();
  jackup.height = window.innerHeight;
  await thenChrome.runtime.sendMessage(chrome.runtime.id, {
    target: 'main',
    action: 'gyazoCaptureWithSize',
    data: data,
    tab: Object.assign(
      { width: window.innerWidth, height: window.innerHeight },
      request.tab
    ),
  });
  jackup.remove();
  unlockScroll(overflow);
};

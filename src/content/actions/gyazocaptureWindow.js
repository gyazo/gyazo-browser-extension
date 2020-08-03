import thenChrome from 'then-chrome';
import { lockScroll, unlockScroll } from '../../libs/scroll';
import { width as pageWidth } from '../../libs/pageScrollSize';
import getZoomAndScale from '../../libs/getZoomAndScale';

export default async (request) => {
  const overflow = lockScroll();
  const data = {};
  const scaleObj = getZoomAndScale();
  data.w = window.innerWidth;
  data.documentWidth = pageWidth();
  data.h = window.innerHeight;
  data.x = window.scrollX;
  data.y = window.scrollY;
  data.t = document.title;
  data.u = location.href;
  data.s = scaleObj.scale;
  data.z = scaleObj.zoom;
  data.positionX = window.scrollX;
  data.positionY = window.scrollY;
  data.defaultPositon = window.scrollY;
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
    unlockScroll(overflow);
  });
};

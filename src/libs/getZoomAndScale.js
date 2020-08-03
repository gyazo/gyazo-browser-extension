import browserInfo from 'bowser';

export default () => {
  let zoom = Math.round((window.outerWidth / window.innerWidth) * 100) / 100;
  // XXX: on Windows, when window is not maximum, it should tweak zoom.(Chrome zoom level 1 is 1.10)
  const isMaximum =
    window.outerHeight === screen.availHeight &&
    window.outerWidth === screen.availWidth;
  if (browserInfo.windows && !isMaximum && zoom > 1.0 && zoom < 1.05) {
    zoom = 1.0;
  }
  const scale = window.devicePixelRatio / zoom;
  return { zoom, scale };
};

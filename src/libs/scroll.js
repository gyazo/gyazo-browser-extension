export const lockScroll = () => {
  const { overflow, overflowY, marginRight } = document.documentElement.style;
  const _w = document.documentElement.getBoundingClientRect().width;
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.overflowY = 'hidden';
  const w = document.documentElement.getBoundingClientRect().width;
  const scrollBarWidth = w - _w;
  return { overflow, overflowY, marginRight, scrollBarWidth };
};

export const unlockScroll = (old = { overflow: 'auto', overflowY: 'auto' }) => {
  document.documentElement.style.overflow = old.overflow;
  document.documentElement.style.overflowY = old.overflowY;
  document.documentElement.style.marginRight = old.marginRight;
};

export const packScrollBar = (old) => {
  document.documentElement.style.marginRight = `${old.scrollBarWidth}px`;
};

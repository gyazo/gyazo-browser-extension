export const height = () =>
  Math.max(
    document.body.clientHeight,
    document.body.offsetHeight,
    document.body.scrollHeight,
    document.documentElement.clientHeight,
    document.documentElement.offsetHeight,
    document.documentElement.scrollHeight
  );

export const width = () =>
  Math.max(
    document.body.clientWidth,
    document.body.offsetWidth,
    document.body.scrollWidth,
    document.documentElement.clientWidth,
    document.documentElement.offsetWidth,
    document.documentElement.scrollWidth
  );

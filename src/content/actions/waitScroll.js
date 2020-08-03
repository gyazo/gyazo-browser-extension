export default (request, sender, sendResponse) => {
  const waitScroll = () => {
    if (
      Math.abs(window.scrollX - request.scrollToX) < 1 &&
      Math.abs(window.scrollY - request.scrollToY) < 1
    ) {
      window.requestAnimationFrame(sendResponse);
    } else {
      window.scrollTo(request.scrollToX, request.scrollToY);
      window.requestAnimationFrame(() => waitScroll());
    }
  };
  waitScroll();
};

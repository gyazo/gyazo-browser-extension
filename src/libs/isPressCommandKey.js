import browserInfo from 'bowser';

export default (event) => {
  //  Return true when
  //  Press CommandKey on MacOSX or CtrlKey on Windows or Linux
  if (!(event instanceof MouseEvent || event instanceof KeyboardEvent)) {
    return false;
  }
  if (browserInfo.mac) {
    return event.metaKey || event.keyIdentifier === 'Meta';
  } else {
    return event.ctrlKey || event.keyIdentifier === 'Control';
  }
};

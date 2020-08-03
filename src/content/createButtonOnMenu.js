export default (loadSvgName, text, shortcutKey) => {
  let btn = document.createElement('div');
  btn.className = 'gyazo-big-button gyazo-button gyazo-menu-element';

  if (shortcutKey) {
    btn.setAttribute('title', 'Press: ' + shortcutKey);
  }

  let iconElm = document.createElement('div');
  iconElm.classList.add('gyazo-button-icon');
  try {
    // Edge cannot fetch to ms-edge-extension:
    window
      .fetch(chrome.runtime.getURL(`imgs/${loadSvgName}.svg`))
      .then((res) => res.text())
      .then((text) => {
        iconElm.innerHTML = text;
      });
  } catch (e) {
    const svgUrl = chrome.runtime.getURL(`imgs/${loadSvgName}.svg`);
    iconElm.innerHTML = `<img src='${svgUrl}' />`;
  }

  let textElm = document.createElement('div');
  textElm.className = 'gyazo-button-text';
  textElm.textContent = text;

  btn.appendChild(iconElm);
  btn.appendChild(textElm);

  return btn;
};

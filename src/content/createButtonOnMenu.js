const createBaseButton = (text, shortcutKey) => {
  let btn = document.createElement('div')
  btn.className = 'gyazo-button gyazo-menu-element'
  if (shortcutKey) {
    btn.setAttribute('title', 'Press: ' + shortcutKey)
  }
  return btn
}

export const regularButton = (loadSvgName, text, shortcutKey) => {
  let btn = createBaseButton(text, shortcutKey)

  let iconElm = document.createElement('div')
  iconElm.classList.add('gyazo-button-icon')
  try {
      // Edge cannot fetch to ms-edge-extension:
    window.fetch(chrome.runtime.getURL(`imgs/${loadSvgName}.svg`))
      .then((res) => res.text())
      .then((text) => { iconElm.innerHTML = text })
  } catch (e) {
    const svgUrl = chrome.runtime.getURL(`imgs/${loadSvgName}.svg`)
    iconElm.innerHTML = `<img src='${svgUrl}' />`
  }
  let textElm = document.createElement('div')
  textElm.className = 'gyazo-button-text'
  textElm.textContent = text
  btn.appendChild(iconElm)
  btn.appendChild(textElm)
  return btn
}

export const wideButton = (iconFileName, text, shortcutKey) => {
  let btn = createBaseButton(text, shortcutKey)
  btn.classList.add('gyazo-wide-button')
  let iconElm = document.createElement('div')
  iconElm.classList.add('gyazo-button-icon')
  const iconImage = document.createElement('img')
  iconImage.src = chrome.runtime.getURL(`imgs/${iconFileName}`)
  iconElm.appendChild(iconImage)
  btn.appendChild(iconElm)

  let textElm = document.createElement('div')
  textElm.className = 'gyazo-button-text'
  textElm.textContent = text
  btn.appendChild(textElm)
  return btn
}

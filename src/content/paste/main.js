import defaultWebsites from './websites'

export default async () => {
  if (document.body.dataset.__gyazoExtensionAddedPasteSupport) return
  const websites = [...defaultWebsites]

  const website = websites.find((e) => e && e.host.test(location.hostname))
  if (!website) return

  document.addEventListener('paste', (event) => {
    const element = event.target
    if (typeof website.className === 'string') {
      if (!element.classList.contains(website.className)) return
    } else if (Array.isArray(website.className)) {
      const containsEnabledClassName = website.className.some((className) => element.classList.contains(className))
      if (!containsEnabledClassName) return
    } else {
      return
    }

    const pasteText = event.clipboardData.getData('text/plain')

    if (!pasteText.match(/^https?:\/\/.*?.?gyazo\.com\/[a-z0-9]{32}$/)) return
    event.preventDefault()

    const mdText = `[![Screenshot from Gyazo](${pasteText}/raw)](${pasteText})`
    const value = element.value
    const replacedText = value.substr(0, element.selectionStart) + mdText + value.substr(element.selectionEnd, value.length)
    const newCursorPos = element.selectionStart + mdText.length
    element.value = replacedText
    element.selectionEnd = newCursorPos
  })

  document.body.dataset.__gyazoExtensionAddedPasteSupport = true
}

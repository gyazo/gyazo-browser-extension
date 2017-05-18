import storage from '../../libs/storageSwitcher'
import defaultWebsites from './websites'

export default async () => {
  let usersSettings
  try {
    usersSettings = (await storage.get({
      pasteWebsites: [],
      pasteSupport: true
    }))
  } catch (e) {}

  if (!usersSettings.pasteSupport) return

  const usersWebsiteSettings = usersSettings ? usersSettings.pasteWebsites : []

  const websites = usersWebsiteSettings.concat(defaultWebsites)

  const website = websites.find((e) => e && e.host.test(location.hostname))
  if (!website) return

  document.addEventListener('paste', (event) => {
    const element = event.target
    if (!element.classList.contains(website.className)) return

    const pasteText = event.clipboardData.getData('text/plain')

    if (!pasteText.match(/^https?:\/\/.*?.?gyazo\.com\/[a-z0-9]{32}$/)) return
    event.preventDefault()

    const mdText = `[![${pasteText}](${pasteText}/raw)](${pasteText})`
    const value = element.value
    const replacedText = value.substr(0, element.selectionStart) + mdText + value.substr(element.selectionEnd, value.length)
    element.value = replacedText
  })
}

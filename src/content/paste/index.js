import storage from '../../libs/storageSwitcher'
import defaultWebsitesInfo from './websitesInfo'

export default async () => {
  let usersSettings
  try {
    usersSettings = (await storage.get({pasteWebsitesInfo: []}))
  } catch (e) {}
  const usersWebsiteSettings = usersSettings ? usersSettings.pasteWebsitesInfo : []

  const websitesInfo = usersWebsiteSettings.concat(defaultWebsitesInfo)

  const websiteInfo = websitesInfo.find((e) => e && e.host.test(location.hostname))
  if (!websiteInfo) return

  document.addEventListener('paste', (event) => {
    const element = event.target
    if (!element.classList.contains(websiteInfo.className)) return

    const pasteText = event.clipboardData.getData('text/plain')

    if (!pasteText.match(/^https?:\/\/.*?.?gyazo\.com\/[a-z0-9]{32}$/)) return
    event.preventDefault()

    const mdText = `[![${pasteText}](${pasteText}/raw)](${pasteText})`
    const value = element.value
    const replacedText = value.substr(0, element.selectionStart) + mdText + value.substr(element.selectionEnd, value.length)
    element.value = replacedText
  })
}

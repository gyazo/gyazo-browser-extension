export default async () => {
  const endpoint = 'https://gyazo.com/user/teams'
  const response = await window.fetch(endpoint, {
    method: 'GET',
    credentials: 'include'
  })
  const error = {
    status: response.status,
    message: chrome.i18n.getMessage('requireLoginTeams')
  }
  if (response.status === 403) return {error}
  const teams = await response.json()
  return {teams}
}

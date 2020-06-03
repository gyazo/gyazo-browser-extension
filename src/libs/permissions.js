import thenChrome from 'then-chrome'

export const permissions = {
  githubPasteSupport: {
    permissions: ['clipboardRead'],
    origins: ['https://github.com/']
  },
  copyUrlToClipboard: {
    permissions: ['clipboardWrite']
  }
}

export const check = async (permissions) => {
  return await thenChrome.permissions.contains(permissions)
}

export const toggle = async (permissions, state) => {
  if (state === undefined) {
    state = await check(permissions)
  }
  if (state) {
    return await thenChrome.permissions.request(permissions)
  } else {
    return await thenChrome.permissions.remove(permissions)
  }
}

import thenChrome from 'then-chrome';

export const permissions = {
  copyUrlToClipboard: {
    permissions: ['clipboardWrite'],
  },
};

export const check = async (permissions) => {
  const res = await thenChrome.permissions.contains(permissions);
  return res;
};

export const toggle = async (permissions, state) => {
  if (state === undefined) {
    state = await check(permissions);
  }
  if (state) {
    const res = await thenChrome.permissions.request(permissions);
    return res;
  } else {
    const res = await thenChrome.permissions.remove(permissions);
    return res;
  }
};

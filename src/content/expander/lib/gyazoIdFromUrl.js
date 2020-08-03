'use strict';

export default function gyazoIdFromUrl(str) {
  let parsedUrl;
  try {
    parsedUrl = new URL(str);
  } catch (e) {
    return;
  }

  if (
    /^(.+\.)?gyazo\.com$/.test(parsedUrl.host) &&
    /^\/[0-9a-f]+$/.test(parsedUrl.pathname)
  ) {
    return parsedUrl.pathname.slice(1);
  }
}

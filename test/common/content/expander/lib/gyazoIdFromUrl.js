const test = require('ava')
const gyazoIdFromUrl = require('../../../../../src/common/content/expander/lib/gyazoIdFromUrl')

test(t => {
  t.ok(gyazoIdFromUrl('https://gyazo.com/79a3a0f0544d132fe9d1a5ed5612d1b4') === '79a3a0f0544d132fe9d1a5ed5612d1b4')
  t.ok(gyazoIdFromUrl('https://nota.gyazo.com/47f75eaa863e63dd2808109d01866ea5') === '47f75eaa863e63dd2808109d01866ea5')

  t.ok(gyazoIdFromUrl('https://google.com/hoge') === undefined)
  t.ok(gyazoIdFromUrl('not url') === undefined)
})

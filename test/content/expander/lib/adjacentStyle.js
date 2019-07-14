import test from 'ava'

import adjacentStyle from '../../../../src/content/expander/lib/adjacentStyle'

test.skip('adjacentStyle', t => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  const style = adjacentStyle(div)

  t.is(style.left, undefined)
  t.is(style.top, undefined)
})

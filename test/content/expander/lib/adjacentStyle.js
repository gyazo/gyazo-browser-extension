import test from 'ava'
import setup from '../../../helpers/setupDom'

import adjacentStyle from '../../../../src/content/expander/lib/adjacentStyle'

test.before(() => setup())

test.skip(t => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  const style = adjacentStyle(div)

  t.is(style.left, undefined)
  t.is(style.top, undefined)
})

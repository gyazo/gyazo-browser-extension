const test = require('ava')
const setup = require('../../../helpers/setupDom')

const adjacentStyle = require('../../../../src/content/expander/lib/adjacentStyle')

test.before(() => setup())

test.skip(t => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  const style = adjacentStyle(div)

  t.is(style.left, undefined)
  t.is(style.top, undefined)
})

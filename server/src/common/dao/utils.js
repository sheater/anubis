const sha1 = require('js-sha1')

function createBaseProps() {
  const now = Date.now()
  const createdAt = Math.round(now / 1000)
  const id = sha1(now.toString() + Math.random().toString())

  return { id, createdAt }
}

module.exports = { createBaseProps }

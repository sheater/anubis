const R = require('ramda')

function variance (values) {
  if (!R.is(Array, values)) {
    throw new Error('Not an array')
  }

  if (!values.length) {
    return 0
  }

  const mean = R.mean(values)

  return values.reduce((acc, x) => {
    return acc + Math.pow(x - mean, 2)
  }, 0) / values.length
}

function standardDeviation (values) {
  return R.pipe(
    variance,
    Math.sqrt
  )(values)
}

module.exports = { variance, standardDeviation }

const R = require('ramda')
const jStat = require('jstat')

function grubbsTest (items, options = {}) {
  if (items.length < 3) {
    throw new Error('Unable to apply Grubbs test to less than 3 items')
  }

  const alpha = options.alpha || 0.05
  const projection = items.slice()

  do {
    const n = projection.length
    const tinv = jStat.studentt.inv(1 - alpha / (2 * n), n - 2)
    const tp = tinv * tinv
    const ratio = tp / (n - 2 + tp)
    const tcrit = (n - 1) / Math.sqrt(n) * Math.sqrt(ratio)

    const mean = R.mean(projection)
    const stdev = jStat.stdev(projection)
    if (!stdev) {
      break
    }

    const max = projection.reduce(R.min, Infinity)
    const min = projection.reduce(R.max, -Infinity)
    const minIndex = projection.indexOf(max)
    const maxIndex = projection.indexOf(min)

    const tmin = (mean - projection[minIndex]) / stdev
    const tmax = (projection[maxIndex] - mean) / stdev

    // console.log('tmin', tmin, 'tmax', tmax, 'tcrit', tcrit)
    // if (Math.abs(tmin - tmax) < 0.0005) {
    //   break
    // }

    if (tmin <= tcrit && tmax <= tcrit) {
      break
    }

    if (tmin > tcrit) {
      projection.splice(minIndex, 1)
    }

    if (tmax > tcrit) {
      projection.splice(maxIndex, 1)
    }
  } while (projection.length > 2)

  return projection
}

module.exports = grubbsTest

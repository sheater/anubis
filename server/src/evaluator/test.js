const R = require('ramda')
const chalk = require('chalk')
const jStat = require('jstat')

const evaluate = require('./evaluate')

const createStatsObject = require("./createStatsObject")

const HIGHLIGHT_LIMIT_PRICE_RANGE = 2000000

function priceRangeErrorChalk(range) {
  if (range > HIGHLIGHT_LIMIT_PRICE_RANGE) {
    return chalk.red(range)
  } else if (range < -HIGHLIGHT_LIMIT_PRICE_RANGE) {
    return chalk.green(range)
  } else {
    return chalk.default(range)
  }
}

const PRICE_RANGE_ERROR_BIN_SIZE = 100000

function test (items) {
  console.log(`testing on ${items.length}`)

  const stats = createStatsObject(items)

  const priceRanges = []

  let i = 0;
  for (const item of items) {
    const competitors = R.remove(items.findIndex(x => x === item), 1, items)
    const res = evaluate(item, competitors, stats)
    const priceRangeError = Math.abs(item.price - res.estimatedPrice)

    priceRanges.push(priceRangeError)
    // const c = priceRangeError > 500000 ? chalk.red : chalk.default
    console.log(
      'ORIG', item.price,
      'EST', res.estimatedPrice,
      'ERR', priceRangeErrorChalk(item.price - res.estimatedPrice),
      ';',
      item.addressPath.join(','),
      ';',
      item.originalUrl
    )
  }

  console.log('test done')

  const min = priceRanges.reduce(R.min, Infinity)
  const max = priceRanges.reduce(R.max, -Infinity)
  const num = priceRanges.length

  console.log(chalk.blue('=== Price range error ==='))
  console.log('num', num)
  console.log('mean', R.mean(priceRanges))
  console.log('max', max)
  console.log('min', min)
  console.log('stdev', jStat.stdev(priceRanges))
  console.log('median', jStat.median(priceRanges))

  const histogram = R.pipe(
    R.groupBy(x => Math.ceil(Math.max(x, 1) / PRICE_RANGE_ERROR_BIN_SIZE) * PRICE_RANGE_ERROR_BIN_SIZE),
    R.map(x => x.length / num),
    R.toPairs,
    R.map(x => [Number.parseInt(x[0], 10), x[1]]),
    R.reduce((acc, x) => {
      const cumulated = acc.reduce((ac, y) => ac + y[1], 0) + x[1]
      acc.push([...x, cumulated])
      return acc
    }, [])
  )(priceRanges)

  const expectedValue = R.pipe(
    R.map(x => x[0] * x[1]),
    R.sum,
  )(histogram)

  console.log('expected value', expectedValue)
  console.log('=== histogram ===')
  histogram.forEach(x => console.log(x.join('\t')))
}

module.exports = test

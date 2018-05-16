const R = require('ramda')
//
// function linearRegression(x, y) {
//   const mapIndexed = R.addIndex(R.map)
//   const n = x.length
//
//   const denominator = (n * R.sum(x.map(x => x * x)) - Math.pow(R.sum(x), 2))
//   const sumxy = R.sum(mapIndexed((xi, i) => xi * y[i])(x))
//   const alpha = (n * sumxy - R.sum(x) * R.sum(y)) / denominator
//   const beta = (R.sum(x.map(x => x * x)) * R.sum(y) - R.sum(x) * sumxy) / denominator
//
//   return { alpha, beta }
// }

function regression (items, endogProp, exogProps) {
  if (!endogProp || !R.is(String, endogProp)) {
    throw new Error('Invalid or missing endog')
  }

  if (!exogProps || !Array.isArray(exogProps)) {
    throw new Error('Invalid or missing exog')
  }

  const endog = items.map(x => x[endogProp])
  const exogs = items.map(x => [
    ...exogProps.map(prop => {
      if (!R.is(Number, x[prop])) {
        throw new Error(`Invalid value for regression "${prop}":"${x[prop]}"`)
      }
      return x[prop]
    }),
    1,
  ])

  const n = items.length
  const k = exogProps.length + 1 // + absolute coeficient
  // const derivatives = exogProps.map(
  //   (_, j) => (betas) => {
  //     // items.forEach(item => endog - )
  //     const sum = items.reduce((acc, item, i) => {
  //       const f = exogProps.reduce((a, prop, jj) => a + exogs[i][jj], 0)
  //       return acc + exogs[i][j] * (endog[i] - f)
  //     }, 0)
  //
  //     return -2 * sum / n
  //   }
  // )

  const funcValue = (i, betas) => {
    return R.sum(
      betas.map((beta, j) => {
        return beta * exogs[i][j]
      }
    ))
  }

  const derivative = (j, betas) => {
    const sum = items.reduce((acc, item, i) => {
      const b = item[endogProp] - funcValue(i, betas)
      return acc + exogs[i][j] * b
    }, 0)

    return sum / n
  }

  const learningRate = 0.00001
  let betas = R.times(() => 0, k)

  for (let i = 0; i < 1000; i++) {
    // console.log('it', betas)
    // console.log('d', derivative(0, betas))
    betas = betas.map((w, j) => w - learningRate * derivative(j, betas))
  }

  return {
    absolute: R.last(betas),
    linear: exogProps.reduce((acc, key, i) => {
      acc[key] = betas[i]
      return acc
    }, {})
  }
}

module.exports = regression

const linearRegression = require('./linearRegression')
//
// const R = require('ramda')
//
// function linReg(x, y) {
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
//
// test('single', () => {
//   const data = [
//     { a: 6.2, y: 26.3 },
//     { a: 6.5, y: 26.65 },
//     { a: 5.48, y: 25.03 },
//     { a: 6.54, y: 26.01 },
//     { a: 7.18, y: 27.9 },
//     { a: 7.93, y: 30.47 },
//   ]
//
//   console.log('slr', linReg(data.map(x => x.a), data.map(x => x.y)))
//
//   const res = linearRegression(data, 'y', ['a'])
//
//   expect(res.absolute).toBe(1.43)
//   expect(res.linear.a).toBe(3.84)
// })

const jStat = require('jstat')

test('multivariate', () => {
  const data = [
    { a: 127,	b: 13, y: 1235 },
    { a: 115, b: 12, y: 1080 },
    // { a: 127, b:	7,	y: 845 },
    // { a: 150,	b: 9,	y: 1522 },
    // { a: 156,	b: 	6,	y:	1047 },
    // { a: 182,	b: 	11,	y:	1979 },
    // { a: 156,	b: 	12,	y:	1822 },
    // { a: 132,	b: 	10,	y:	1253 },
    // { a: 137,	b: 	9,	y:	1297 },
    // { a: 113,	b: 	9,	y:	946 },
    // { a: 137,	b: 	15,	y:	1713 },
    // { a: 117,	b: 	11,	y:	1024 },
    // { a: 137,	b: 	8,	y:	1147 },
    // { a: 153,	b: 	6,	y:	1092 },
    // { a: 117,	b: 	13,	y:	1152 },
    // { a: 126,	b: 	10,	y:	1336 },
    // { a: 170,	b: 	14,	y:	2131 },
    // { a: 182,	b: 	8,	y:	1550 },
    // { a: 162,	b: 	11,	y:	1884 },
    // { a: 184,	b: 	10,	y:	2041 },
    // { a: 143,	b: 	6,	y:	854 },
    // { a: 159,	b: 	9,	y:	1483 },
    // { a: 108,	b: 	14,	y:	1055 },
    // { a: 175,	b: 	8,	y:	1545 },
    // { a: 108,	b: 	6,	y:	729 },
    // { a: 179,	b: 	9,	y:	1792 },
    // { a: 111,	b: 	15,	y:	1175 },
    // { a: 187,	b: 	8,	y:	1593 },
    // { a: 111,	b: 	7,	y:	785 },
    // { a: 115,	b: 	7,	y:	744 },
    // { a: 194,	b: 	5,	y:	1356 },
    // { a: 168,	b: 	7,	y:	1262 },
  ]

  const r = jStat.models.ols(data.map(x => x.y), data.map(x => [1, x.a, x.b]))
  console.log('kokot', r.coef)

  // const res = linearRegression(data, 'y', ['a', 'b'])
  //
  // console.log('res', res)
  //
  // expect(res.absolute).toBe(-1336.722052)
  // expect(res.linear.a).toBe(12.73619884)
  // expect(res.linear.b).toBe(85.8151326)
})

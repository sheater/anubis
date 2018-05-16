const grubbsTest = require('./grubbsTest')
const R = require('ramda')

test('exclude outliers', () => {
  const data = [199.31, 199.53, 200.19, 200.82, 201.92, 201.95, 202.18, 245.57]

  const result = grubbsTest(data, { alpha: 0.05 })

  expect(result).toEqual(R.dropLast(1, data))
})

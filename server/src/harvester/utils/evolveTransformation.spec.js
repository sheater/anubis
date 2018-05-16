const evolveTransformation = require('./evolveTransformation')

test('with null param', () => {
  const def = {
    'foo': (x) => x.foo * 2,
    'bar': () => null,
  }

  const entity = {
    'foo': 4,
    'bar': 'hello',
  }

  expect(evolveTransformation(def)(entity)).toEqual({ foo: 8 })
})

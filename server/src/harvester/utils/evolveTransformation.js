const R = require('ramda')

function evolveTransformation (def) {
  return function (snapshot) {
    const errors = []
    const warnings = []

    const competitor = R.pipe(
      R.mapObjIndexed((aspectTransformFunc, key) => {
        try {
          const result = aspectTransformFunc(snapshot)

          if (!R.isNil(snapshot[key]) && R.isNil(result)) {
            warnings.push({ key, message: `Unresolved value "${snapshot[key]}"` })
          }

          return result
        }
        catch (error) {
          errors.push({ key, message: error.toString() })
          return null
        }
      }),
      R.pickBy(R.compose(R.not, R.isNil))
    )(def)

    return { errors, warnings, competitor }
  }
}

module.exports = evolveTransformation

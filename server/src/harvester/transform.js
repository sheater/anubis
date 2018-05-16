const { Observable } = require('rxjs')
const R = require('ramda')

const { geocode } = require('../common/googleMaps')
const { AspectType } = require('../common/consts')

geocode('Brno, Pekarska 74').then((res) => {
  console.log('res', res)
})

const ErrorType = {
  NOT_DEFINED: 'not_defined',
  INVALID_VALUE: 'invalid_value'
}

// FIXME: move to another file
function validateCompetitor(competitor) {
  const errors = {}

  if (!competitor[AspectType.PRICE]) {
    errors[AspectType.PRICE] = ErrorType.NOT_DEFINED
  }
  else {
    if (!R.is(Number, competitor[AspectType.PRICE])) {
      errors[AspectType.PRICE] = ErrorType.INVALID_VALUE
    }
  }

  if (!competitor[AspectType.SIZE]) {
    errors[AspectType.SIZE] = ErrorType.NOT_DEFINED
  }
  else {
    if (!R.is(Number, competitor[AspectType.SIZE])) {
      errors[AspectType.SIZE] = ErrorType.SIZE
    } else if (competitor[AspectType.SIZE] < 16) {
      errors[AspectType.SIZE] = ErrorType.INVALID_VALUE
    }
  }

  return errors
}

async function transform (adapters, scrapeLog) {
  return new Observable.create(async (observer) => {

  })
}

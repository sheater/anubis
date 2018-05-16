const R = require('ramda')

const { createClient } = require('@google/maps')

const googleMapsClient = createClient({
  key: 'AIzaSyBpPJHrZz01owK5hpM2SmimcFfJpPZP6Fk',
})

function geocode (address) {
  return new Promise((resolve, reject) => googleMapsClient.geocode(
    { address, language: 'cs' },
    function(err, response) {
      if (err) {
        reject(err)
      }
      else {
        resolve(response.json.results)
      }
    }
  ))
}

function extractAddressPathFromAddressComponents (addressComponents) {
  return addressComponents
    .filter(x => !x.types.includes('postal_code'))
    .map(R.prop('short_name'))
    .reverse()
}

module.exports = { geocode, extractAddressPathFromAddressComponents }

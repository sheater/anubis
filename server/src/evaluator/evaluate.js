const R = require('ramda')
const statUtils = require('../utils/stats')
const grubbsTest = require('../utils/grubbsTest')

const NUM_COMPETITORS = 7

const ASPECT_WEIGHTS = {
  size: 4.7,
  flatCondition: 0.5,
  numRooms: 0.2,
  kitchenType: 0.2,
  constructionType: 0.2,
  ownershipType: 0.1,
}

function getAspectCoeff (aspectName, attrs, competitor, stats) {
  if (attrs[aspectName] && competitor[aspectName]) {
    const ours = stats[aspectName].find(x => x.key === attrs[aspectName])
    const theirs = stats[aspectName].find(x => x.key === competitor[aspectName])

    if (ours && theirs) {
      return ours.mean / theirs.mean
    }
  }

  return 1
}

function evaluate (attrs, items, stats) {
  const origLat = R.head(attrs.coords)
  const origLon = R.last(attrs.coords)

  const aspiringCompetitors = attrs.addressPath
    .reduceRight((acc, addressPart, i) => {
      if (acc.length < NUM_COMPETITORS) {
        const filteredItems = items.filter(x =>
          x.addressPath.length > i && x.addressPath[i] === addressPart)

        return R.uniqBy(x => x.id, R.concat(acc, filteredItems))
      }

      return acc
    }, [])

  const competitors = R.pipe(
    R.map(x => ({ ...x, unitPrice: x.price / x.size })),
    R.map(x => {
      const lat = R.head(x.coords)
      const lon = R.last(x.coords)
      const distPow = Math.pow(origLat - lat, 2) + Math.pow(origLon - lon, 2)

      return Object.assign({}, x, { distPow })
    }),
    R.sort((a, b) => a.distPow - b.distPow),
    R.slice(0, NUM_COMPETITORS),
    R.map(c => {
      const coeffs = {
        size: attrs.size / c.size,
        numRooms: attrs.numRooms / c.numRooms,
        kitchenType: getAspectCoeff("kitchenType", attrs, c, stats),
        constructionType: getAspectCoeff("constructionType", attrs, c, stats),
        flatCondition: getAspectCoeff("flatCondition", attrs, c, stats),
        ownershipType: getAspectCoeff("ownershipType", attrs, c, stats)
      }

      const numerator = R.pipe(
        R.mapObjIndexed((v, k) => v * ASPECT_WEIGHTS[k]),
        Object.values,
        R.reduce(R.add, 0)
      )(coeffs)
      const denominator = Object.values(ASPECT_WEIGHTS).reduce(R.add, 0)
      const index = numerator / denominator

      return {
        ...c,
        index,
        adjustedPrice: c.price * index,
      }
    }),
    (items) => {
      const getGrubbsCriterionValue = x => x.price
      const prices = items.map(getGrubbsCriterionValue)
      const withoutOutliers = grubbsTest(prices)
      const min = withoutOutliers.reduce(R.min, Infinity)
      const max = withoutOutliers.reduce(R.max, -Infinity)

      return items.filter(x => {
        const unitPrice = getGrubbsCriterionValue(x)
        return unitPrice >= min && unitPrice <= max
      })
    },
  )(aspiringCompetitors)

  const standardDeviation = Math.round(statUtils.standardDeviation(competitors.map(x => x.price)))
  const estimatedPrice = Math.round(R.mean(competitors.map(x => x.price * x.index)))
  const estimatedUnitPrice = estimatedPrice / attrs.size

  return {
    competitors,
    estimatedPrice,
    estimatedUnitPrice,
    standardDeviation,
  }
}

module.exports = evaluate

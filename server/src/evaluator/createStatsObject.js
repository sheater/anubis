const R = require("ramda")

const averageUnitPriceByAspect = (aspectName) => R.pipe(
  R.groupBy(x => x[aspectName]),
  R.map(R.pipe(
    R.map(y => y.price / y.size),
    R.mean,
  ))
)

const createAspectScale = (aspectName) => (items) => {
  const averages = averageUnitPriceByAspect(aspectName)(items)
  const min = R.pipe(Object.values, R.reduce(R.min, Infinity))(averages)

  return R.pipe(
    R.mapObjIndexed((mean, key) => ({ key, mean })),
    Object.values,
    R.map(x => ({ ...x, scale: x.mean - min })),
    R.sortBy(x => x.scale)
  )(averages)
}

function createStatsObject (items) {
  const constructionType = createAspectScale("constructionType")(items)//averageUnitPriceByAspect("constructionType")(items)
  const flatCondition = createAspectScale("flatCondition")(items)
  const kitchenType = createAspectScale("kitchenType")(items)
  const ownershipType = createAspectScale("ownershipType")(items)
  // const basement = createAspectScale("basement")(items)

  return {
    constructionType,
    flatCondition,
    kitchenType,
    ownershipType,
    // basement,
  }
}

module.exports = createStatsObject

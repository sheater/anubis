import React from 'react'
import * as R from 'ramda'

import withComparison from '../../../decorators/withComparison'
import { renderPrice } from '../../../../../utils/renderNumber'

const filterByFlatCondition = (flatCondition) => R.pipe(
  R.filter(x => x.flatCondition === flatCondition),
  R.map(x => x.unitPrice),
)

const View = withComparison(({ competitors }) => {
  const data = competitors.map(x => Object.assign({}, x, { unitPrice: x.price / x.size }))
  const newOnes = filterByFlatCondition('NEW')(data)
  const afterReconstruction = filterByFlatCondition('AFTER_RECONSTRUCTION')(data)
  const veryGood = filterByFlatCondition('VERY_GOOD')(data)
  const good = filterByFlatCondition('GOOD')(data)
  const building = filterByFlatCondition('BUILDING')(data)
  const beforeReconstruction = filterByFlatCondition('BEFORE_RECONSTRUCTION')(data)

  return (
    <div>
      <p>new ({newOnes.length}): {renderPrice(R.mean(newOnes))}</p>
      <p>after reconstruction ({afterReconstruction.length}): {renderPrice(R.mean(afterReconstruction))}</p>
      <p>very good ({veryGood.length}): {renderPrice(R.mean(veryGood))}</p>
      <p>good ({good.length}): {renderPrice(R.mean(good))}</p>
      <p>building ({building.length}): {renderPrice(R.mean(building))}</p>
      <p>before reconstruction ({beforeReconstruction.length}): {renderPrice(R.mean(beforeReconstruction))}</p>
    </div>
  )
})

const Condition = ({ competitors }) => {
  return (
    <div>
      <h2>flat condition</h2>
      <View competitors={competitors} />
    </div>
  )
}

export default Condition

import React from 'react'
import * as R from 'ramda'

import withComparison from '../../../decorators/withComparison'
import { renderPrice } from '../../../../../utils/renderNumber'

const filterByKitchenType = (kitchenType) => R.pipe(
  R.filter(x => x.kitchenType === kitchenType),
  R.map(x => x.unitPrice),
)

const View = withComparison(({ competitors }) => {
  const data = competitors.map(x => Object.assign({}, x, { unitPrice: x.price / x.size }))
  const kk = filterByKitchenType('KK')(data)
  const one = filterByKitchenType('1')(data)

  return (
    <div>
      <p>kk ({kk.length}): {renderPrice(R.mean(kk))}</p>
      <p>1 ({one.length}): {renderPrice(R.mean(one))}</p>
    </div>
  )
})

const KitchenType = ({ competitors }) => {
  return (
    <div>
      <h2>kitchen type</h2>
      <View competitors={competitors} />
    </div>
  )
}

export default KitchenType

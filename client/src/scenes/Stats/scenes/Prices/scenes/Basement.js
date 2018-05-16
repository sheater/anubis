import React from 'react'
import * as R from 'ramda'

import withComparison from '../../../decorators/withComparison'
import { renderPrice } from '../../../../../utils/renderNumber'

const filterByBasement = (hasBasement) => R.pipe(
  R.filter(x => x.basement === hasBasement),
  R.map(x => x.unitPrice),
)

const View = withComparison(({ competitors }) => {
  const data = competitors.map(x => Object.assign({}, x, { unitPrice: x.price / x.size }))
  const withBasement = filterByBasement(true)(data)
  const withoutBasement = filterByBasement(false)(data)

  return (
    <div>
      <p>with basement ({withBasement.length}): {renderPrice(R.mean(withBasement))}</p>
      <p>without basement ({withoutBasement.length}): {renderPrice(R.mean(withoutBasement))}</p>
    </div>
  )
})

const Basement = ({ competitors }) => {
  return (
    <div>
      <h2>basement</h2>
      <View competitors={competitors} />
    </div>
  )
}

export default Basement

import React from 'react'
import * as R from 'ramda'

import withComparison from '../../../decorators/withComparison'
import { renderPrice } from '../../../../../utils/renderNumber'

const filterByOwnership = (ownershipType) => R.pipe(
  R.filter(x => x.ownershipType === ownershipType),
  R.map(x => x.unitPrice),
)

const View = withComparison(({ competitors }) => {
  const data = competitors.map(x => Object.assign({}, x, { unitPrice: x.price / x.size }))
  const society = filterByOwnership('SOCIETY')(data)
  const personal = filterByOwnership('PERSONAL')(data)

  return (
    <div>
      <p>personal ({personal.length}): {renderPrice(R.mean(personal))}</p>
      <p>society ({society.length}): {renderPrice(R.mean(society))}</p>
    </div>
  )
})

const Ownership = ({ competitors }) => {
  return (
    <div>
      <h2>ownership type</h2>
      <View competitors={competitors} />
    </div>
  )
}

export default Ownership

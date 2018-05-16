import React from 'react'
import * as R from 'ramda'

import withComparison from '../../../decorators/withComparison'
import { renderPrice } from '../../../../../utils/renderNumber'

const filterByConstructionType = (constructionType) => R.pipe(
  R.filter(x => x.constructionType === constructionType),
  R.map(x => x.unitPrice),
)

const View = withComparison(({ competitors }) => {
  const data = competitors.map(x => Object.assign({}, x, { unitPrice: x.price / x.size }))
  const panel = filterByConstructionType('PANEL')(data)
  const brick = filterByConstructionType('BRICK')(data)
  // const skeleton = filterByConstructionType('SKELETON')(data)
  const mix = filterByConstructionType('MIX')(data)
  // const wood = filterByConstructionType('WOOD')(data)

  return (
    <div>
      <p>panel ({panel.length}): {renderPrice(R.mean(panel))}</p>
      <p>brick ({brick.length}): {renderPrice(R.mean(brick))}</p>
      {/*<p>skeleton ({skeleton.length}): {renderPrice(R.mean(skeleton))}</p>*/}
      <p>mix ({mix.length}): {renderPrice(R.mean(mix))}</p>
      {/*<p>wood ({wood.length}): {renderPrice(R.mean(wood))}</p>*/}
    </div>
  )
})

const Basement = ({ competitors }) => {
  return (
    <div>
      <h2>construction type</h2>
      <View competitors={competitors} />
    </div>
  )
}

export default Basement

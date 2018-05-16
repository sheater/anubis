import React from 'react'
import * as jStat from 'jstat'

import { renderDecimal } from '../../../../../utils/renderNumber'
import { Pair, Key, Value } from './keyValueStyle'

const SpearmanCoefficient = ({ data }) => (
  <Pair>
    <Key>Spearman's correlation coefficient:</Key>
    <Value>
      {renderDecimal(
        jStat.spearmancoeff(data.map(x => x.x), data.map(x => x.y)).toString()
      )}
    </Value>
  </Pair>
)

export default SpearmanCoefficient

import React from 'react'
import * as jStat from 'jstat'

import { renderDecimal } from '../../../../../utils/renderNumber'
import { Pair, Key, Value } from './keyValueStyle'

const CorrelationCoefficient = ({ data }) => (
  <Pair>
    <Key>Pearson's correlation coefficient:</Key>
    <Value>
      {renderDecimal(
        jStat.corrcoeff(data.map(x => x.x), data.map(x => x.y)).toString()
      )}
    </Value>
  </Pair>
)

export default CorrelationCoefficient

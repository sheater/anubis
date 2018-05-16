import React from 'react'

import { Pair, Key, Value } from './keyValueStyle'

const ItemsCount = ({ data }) => (
  <Pair>
    <Key>number of items:</Key>
    <Value>{data.length}</Value>
  </Pair>
)

export default ItemsCount

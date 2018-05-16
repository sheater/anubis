import React from 'react'
import NumberFormat from 'react-number-format'

export const renderPrice = (x) => (
  <NumberFormat
    value={x || 0}
    thousandSeparator={" "}
    decimalScale={0}
    displayType={'text'}
  />
)

export const renderDecimal = (x) => (
  <NumberFormat
    value={x || 0}
    decimalScale={3}
    displayType={'text'}
  />
)

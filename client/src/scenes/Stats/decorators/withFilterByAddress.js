import React from 'react'

export default function withFilterByAddress(Component) {
  return (props) => {
    const competitors = props.filter
      ? props.competitors
        .filter(x => x.addressPath.includes(props.filter))
      : props.competitors

    return <Component competitors={competitors} />
  }
}

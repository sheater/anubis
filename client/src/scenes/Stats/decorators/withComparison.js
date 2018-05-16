import React from 'react'
import { Row, Col } from 'antd'

import withFilterByAddress from './withFilterByAddress'

export default function withComparison(Component) {
  const View = withFilterByAddress(Component)

  return (props) => {
    return (
      <Row gutter={36}>
        <Col span={12}>
          <h3>Jihomoravský kraj</h3>
          <View competitors={props.competitors} />
        </Col>
        <Col span={12}>
          <h3>Brno-město</h3>
          <View
            competitors={props.competitors}
            filter="Brno-město"
          />
        </Col>
      </Row>
    )
  }
}

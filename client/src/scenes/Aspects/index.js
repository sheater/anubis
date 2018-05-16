import React from 'react'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { compose, mapProps } from 'recompose'
import * as R from 'ramda'
import { Table } from 'antd'

import AspectStat from './components/AspectStats'

const aspectsGraphql = graphql(gql`
  query {
    aspects
  }
`)

const Aspects = ({ aspects, loading }) => {
  const columns = R.pipe(
    R.head,
    R.keys,
    R.map(x => ({ title: x, dataIndex: x, key: x })),
  )(aspects || [])

  return (
    <Table
      // scroll={{ y: 400 }}
      columns={columns}
      dataSource={aspects}
      loading={loading}
      pagination={false}
      expandedRowRender={item => <AspectStat item={item} />}
    />
  )
}

export default compose(
  aspectsGraphql,
  mapProps(
    R.pipe(
      R.prop('data'),
      R.pick(['aspects', 'loading'])
    )
  )
)(Aspects)

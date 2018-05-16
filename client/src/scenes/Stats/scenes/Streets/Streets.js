import React from 'react'
import { Table, Spin } from 'antd'
import { compose, withProps } from 'recompose'
import * as R from 'ramda'

import listAll from '../../../Competitors/services/listAll'
import { renderPrice } from '../../../../utils/renderNumber'

const Streets = ({ competitors, loading }) => {
  if (loading) {
    return <Spin />
  }

  const maxDepth = 4

  const columns = [
    {
      key: 'district',
      dataIndex: 'district',
      title: 'District',
    },
    {
      key: 'numCompetitors',
      dataIndex: 'numCompetitors',
      title: 'Num competitors',
      sorter: (a, b) => a.numCompetitors - b.numCompetitors,
    },
    {
      key: 'averageUnitPrice',
      dataIndex: 'averageUnitPrice',
      title: 'Average unit price',
      render: renderPrice,
      sorter: (a, b) => a.averageUnitPrice - b.averageUnitPrice,
      defaultSortOrder: 'descend'
    },
  ]

  const data = R.pipe(
    R.groupBy(x => Array.from(x.addressPath).slice(0, maxDepth)),
    Object.values,
    R.map(x => {
      const first = R.head(x)

      const district = Array.from(first.addressPath).slice(0, maxDepth).join(', ')
      const numCompetitors = x.length
      const averageUnitPrice = R.mean(x.map(c => c.price / c.size))
      const streets = R.uniq(x.map(c => Array.from(c.addressPath).slice(maxDepth))).join(', ')

      return {
        district,
        numCompetitors,
        averageUnitPrice,
        streets,
      }
    })
  )(competitors)

  return (
    <Table
      columns={columns}
      rowKey={record => record.source}
      dataSource={data}
      expandedRowRender={(record) => <div>{record.streets}</div>}
      pagination={false}
    />
  )
}

export default compose(
  listAll,
  withProps(
    R.pipe(
      R.prop('data'),
      R.pick(['competitors', 'loading'])
    )
  )
)(Streets)

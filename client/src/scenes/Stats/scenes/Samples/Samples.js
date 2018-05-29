import React from 'react'
import { compose, withProps } from 'recompose'
import { Spin, Layout, Table } from 'antd'
import * as R from 'ramda'
import * as jStat from 'jstat'

const { Content } = Layout

import { renderPrice } from '../../../../utils/renderNumber'
import listAll from '../../../Competitors/services/listAll'

const Samples = ({ competitors, loading }) => {
  if (loading) {
    return <Spin />
  }

  const columns = [
    {
      title: 'Source',
      dataIndex: 'source',
    },
    {
      title: 'Num',
      dataIndex: 'count',
    },
    {
      title: 'Average price',
      dataIndex: 'averagePrice',
      render: renderPrice,
    },
    {
      title: 'Average unit price',
      dataIndex: 'averageUnitPrice',
      render: renderPrice,
    },
    {
      title: 'Minimal unit price',
      dataIndex: 'minUnitPrice',
      render: renderPrice,
    },
    {
      title: 'Maximal unit price',
      dataIndex: 'maxUnitPrice',
      render: renderPrice,
    },
    {
      title: 'Standard deviation',
      dataIndex: 'sd',
      render: renderPrice,
    },
  ]

  const data = R.pipe(
    R.groupBy(x => x.source),
    R.mapObjIndexed((x, source) => {
      const averagePrice = R.mean(x.map(y => y.price))
      const unitPrices = x.map(y => y.price / y.size)
      const averageUnitPrice = R.mean(unitPrices)
      const minUnitPrice = unitPrices.reduce(R.min, Infinity)
      const maxUnitPrice = unitPrices.reduce(R.max, -Infinity)
      const sd = jStat.stdev(unitPrices)

      return {
        count: unitPrices.length,
        averagePrice,
        averageUnitPrice,
        minUnitPrice,
        maxUnitPrice,
        sd,
        source,
      }
    }),
    Object.values,
  )(competitors)

  return (
    <Content style={{ padding: '20px' }}>
      <Table
        columns={columns}
        rowKey={record => record.source}
        dataSource={data}
        pagination={false}
        loading={loading}
      />
    </Content>
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
)(Samples)

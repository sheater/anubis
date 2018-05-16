import React from 'react'
import { compose, withProps } from 'recompose'
import * as R from 'ramda'
import { Table, Spin } from 'antd'
import NumberFormat from 'react-number-format'

import listAll from '../../../Competitors/services/listAll'
import Ownership from './scenes/Ownership'
import Basement from './scenes/Basement'
import FlatCondition from './scenes/FlatCondition'
import ConstructionType from './scenes/ConstructionType'
import KitchenType from './scenes/KitchenType'
import {Layout} from "antd/lib/index"

const renderNumber = (x) => <NumberFormat value={x || 0} thousandSeparator={" "} decimalScale={0} displayType={'text'} />
//
// class Stats extends React.Component {
//   render() {
//     const { loading, stats } = this.props
//     const columns = [
//       {
//         title: 'Source',
//         dataIndex: 'source',
//       },
//       {
//         title: 'Average price',
//         dataIndex: 'averagePrice',
//         render: renderNumber,
//       },
//       {
//         title: 'Average unit price',
//         dataIndex: 'averageUnitPrice',
//         render: renderNumber,
//       },
//       {
//         title: 'Minimal unit price',
//         dataIndex: 'minUnitPrice',
//         render: renderNumber,
//       },
//       {
//         title: 'Maximal unit price',
//         dataIndex: 'maxUnitPrice',
//         render: renderNumber,
//       },
//       {
//         title: 'Standard deviation',
//         dataIndex: 'sd',
//         render: renderNumber,
//       },
//     ]
//
//     return (
//       <div>
//         <Table
//           columns={columns}
//           rowKey={record => record.source}
//           dataSource={stats ? stats.prices : []}
//           pagination={false}
//           loading={loading}
//         />
//       </div>
//     )
//   }
// }

const { Content } = Layout

const Stats = ({ loading, competitors }) => {
  if (loading) {
    return <Spin />
  }

  return (
    <Content style={{ padding: '20px' }}>
      <Ownership competitors={competitors} />
      <FlatCondition competitors={competitors} />
      <ConstructionType competitors={competitors} />
      <Basement competitors={competitors} />
      <KitchenType competitors={competitors} />
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
)(Stats)

import React from 'react'
import { compose, withProps } from 'recompose'
import { Spin, Layout } from 'antd'
import * as R from 'ramda'

const { Content } = Layout

import listAll from '../../../Competitors/services/listAll'

import SizeAndPrice from './scenes/SizeAndPrice'
import SizeAndUnitPrice from './scenes/SizeAndUnitPrice'
import SizeAndNumRooms from './scenes/SizeAndNumRooms'
import NumRoomsAndUnitPrice from './scenes/NumRoomsAndUnitPrice'
import FloorNumAndUnitPrice from './scenes/FloorNumAndUnitPrice'
import DowntownDistanceAndUnitPrice from './scenes/DowntownDistanceAndUnitPrice'

const Correlation = ({ competitors, loading }) => {
  if (loading) {
    return <Spin />
  }

  return (
    <Content style={{ padding: '20px' }}>
      <SizeAndPrice competitors={competitors} />
      <SizeAndUnitPrice competitors={competitors} />
      <SizeAndNumRooms competitors={competitors} />
      <NumRoomsAndUnitPrice competitors={competitors} />
      <FloorNumAndUnitPrice competitors={competitors} />
      <DowntownDistanceAndUnitPrice competitors={competitors} />
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
)(Correlation)

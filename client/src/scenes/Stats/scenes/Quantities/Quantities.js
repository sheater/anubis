import React from 'react'
import { compose, withProps } from 'recompose'
import { Spin, Layout } from 'antd'
import { Scatter, Bar } from 'react-chartjs-2'
import * as R from 'ramda'
import * as jStat from 'jstat'

const { Content } = Layout

import listAll from '../../../Competitors/services/listAll'

function getRandomColor(alpha = null) {
  // var letters = '0123456789ABCDEF';
  // var color = '#';
  // for (var i = 0; i < 6; i++) {
  //   color += letters[Math.floor(Math.random() * 16)];
  // }
  // return color;
  // const range = 100
  // const cc = () => Math.round(220 - range + Math.random() * range)
  // // const cg = `${cc()},${cc()},${cc()}`
  // const cg = `0,0,${cc()}`
  //
  // if (alpha) {
  //   return `rgba(${cg},${alpha})`
  // }
  // else {
  //   return `rgb(${cg})`
  // }
  return '#ffb600'
}

function roundToDecade(n) {
  return Math.ceil((n + 1) / 10) * 10
}

function formatNumRoomsWithKitchen(x) {
  return `${x.numRooms}+${x.kitchenType}`
}

const FlatSizeHistogram = ({ competitors }) => {
  const bySizes = R.pipe(
    R.groupBy(x => roundToDecade(x.size)),
    R.map(x => {
      const d = roundToDecade(R.head(x).size)
      return {
        x: `${d - 10}-${d - 1}`,
        y: x.length
      }
    }),
    Object.values,
  )(competitors)

  return (
    <div>
      <h2>number of flats by size</h2>
      <Bar
        data={{
          labels: bySizes.map(x => x.x),
          datasets: [{
            data: bySizes.map(x => x.y),
            backgroundColor: bySizes.map(() => getRandomColor(0.8)),
          }]
        }}

        options={{ legend: { display: false } }}
      />
    </div>
  )
}

const NumRoomsHistogram = ({ competitors }) => {
  const byNumRooms = R.pipe(
    R.groupBy(formatNumRoomsWithKitchen),
    Object.values,
    R.map(x => {
      return {
        x: formatNumRoomsWithKitchen(R.head(x)),
        y: x.length,
      }
    }),
    R.sortBy(R.prop('x')),
  )(competitors)

  return (
    <div>
      <h2>number of flats by number of rooms</h2>
      <Bar
        data={{
          labels: byNumRooms.map(x => x.x),
          datasets: [{
            data: byNumRooms.map(x => x.y),
            backgroundColor: byNumRooms.map(() => getRandomColor(0.8))
          }]
        }}

        options={{ legend: { display: false } }}
      />
    </div>
  )
}

const Quantities = ({ competitors, loading }) => {
  if (loading) {
    return <Spin />
  }

  return (
    <Content style={{ padding: '20px' }}>
      <FlatSizeHistogram competitors={competitors} />
      <NumRoomsHistogram competitors={competitors} />
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
)(Quantities)

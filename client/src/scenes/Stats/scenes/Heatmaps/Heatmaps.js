import React from 'react'
import { Layout, Spin } from 'antd'
import listAll from "../../../Competitors/services/listAll"
import {compose, withProps} from "recompose"
import * as R from "ramda"
import ReactMapboxGl, { Layer, Feature } from "react-mapbox-gl";
const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1Ijoic3RlcGhlMTciLCJhIjoidzl3OHJFRSJ9.m0Lk2gQHpwyD80FesrT8iQ"
});

const data = require('./cities')

const layerPaint = {
  'heatmap-weight': {
    property: 'unitPrice',
    type: 'exponential',
    stops: [[0, 0], [0.5, 0.2]]
  },
  // Increase the heatmap color weight weight by zoom level
  // heatmap-intensity is a multiplier on top of heatmap-weight
  // 'heatmap-intensity': {
  //   stops: [[0, 0], [5, 1.2]]
  // },
  'heatmap-intensity': 0.4,
  // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
  // Begin color ramp at 0-stop with a 0-transparency color
  // to create a blur-like effect.
  'heatmap-color': [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    'rgba(33,102,172,0)',
    0.25,
    'rgb(103,169,207)',
    0.5,
    'rgb(209,229,240)',
    0.8,
    'rgb(253,219,199)',
    1,
    'rgb(239,138,98)',
    2,
    'rgb(178,24,43)'
  ],
  // Adjust the heatmap radius by zoom level
  // 'heatmap-radius': {
  //   stops: [[0, 1], [5, 50]]
  // }
  'heatmap-radius': 100,
};

const { token, styles } = {
  "token": "pk.eyJ1IjoiYWxleDMxNjUiLCJhIjoiY2o0MHp2cGtiMGFrajMycG5nbzBuY2pjaiJ9.QDApU0XH2v35viSwQuln5w",
  "styles": {
    "londonCycle": "mapbox://styles/alex3165/cj2hv9v4y00242slphcyk9oca",
    "light": "mapbox://styles/mapbox/light-v9",
    "dark": "mapbox://styles/mapbox/dark-v9",
    "basic": "mapbox://styles/mapbox/basic-v9",
    "outdoor": "mapbox://styles/mapbox/outdoors-v10"
  }
}

const mapStyle = {
  // flex: 1
  width: '100%',
  height: '400px',
}

const { Content } = Layout

const UnitPriceHeatmap = ({ competitors }) => {
  console.log('competitors', competitors)
  // const data = competitors.map(x => ({ latlng }))
  const lats = competitors.map(x => x.coords[1])
  const lngs = competitors.map(x => x.coords[0])
  const midLat = R.mean(lats)
  const midLng = R.mean(lngs)
  const data = competitors.map(x => ({ latlng: [x.coords[1], x.coords[0]], unitPrice: x.price / x.size }))
  return (
    <div>
      <h2>Unit price</h2>
      <Map
        style={styles.dark}
        center={[midLat, midLng]}
        zoom={[10]}
        containerStyle={mapStyle}
      >
        <Layer type="heatmap" paint={layerPaint}>
          {data.map((el, index) => (
            <Feature key={index} coordinates={el.latlng} properties={el} />
          ))}
        </Layer>
      </Map>
    </div>
  )
}

const Heatmaps = ({ competitors, loading }) => {
  if (loading) {
    return <Spin />
  }

  return (
    <Content style={{ padding: '20px' }}>
      <UnitPriceHeatmap competitors={competitors} />
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
)(Heatmaps)

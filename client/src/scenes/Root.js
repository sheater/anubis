import React from "react"
import { Switch, Route } from "react-router"
import gql from 'graphql-tag'
import { graphql } from "react-apollo"
import { compose, mapProps } from 'recompose'
import * as R from 'ramda'

import RootLoader from './../components/RootLoader'
import Layout from "./Layout"
import Mining from "./Mining"
import Snapshots from "./Snapshots"
import Aspects from './Aspects'
import Competitors from "./Competitors"
import Prices from "./Stats/scenes/Prices/Prices"
import Quantities from './Stats/scenes/Quantities/Quantities'
import Correlation from './Stats/scenes/Correlation/Correlation'
import Heatmaps from './Stats/scenes/Heatmaps/Heatmaps'
import Streets from './Stats/scenes/Streets/Streets'
import Samples from './Stats/scenes/Samples/Samples'
import Evaluate from './Evaluate'

const query = gql`
  query {
    global {
      adapters {
        id, name
      }
    }
  }
`

const rootGraphql = graphql(query)

const Root = ({ global, loading }) => {
  if (loading) {
    return <RootLoader />
  }

  return (
    <Layout global={global}>
      <Switch>
        <Route path="/" exact component={Mining} />
        <Route path="/mining" exact component={Mining} />
        <Route path="/snapshots/:adapter" component={Snapshots} />
        <Route path="/aspects" component={Aspects} />
        <Route path="/competitors" component={Competitors} />
        <Route path="/stats/prices" component={Prices} />
        <Route path="/stats/correlation" component={Correlation} />
        <Route path="/stats/quantities" component={Quantities} />
        <Route path="/stats/heatmaps" component={Heatmaps} />
        <Route path="/stats/streets" component={Streets} />
        <Route path="/stats/samples" component={Samples} />
        <Route path="/evaluate" component={Evaluate} />
      </Switch>
    </Layout>
  )
}

export default compose(
  rootGraphql,
  mapProps(R.compose(
    R.pick(['global', 'loading']),
    R.prop('data')
  ))
)(Root)

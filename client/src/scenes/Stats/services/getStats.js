import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

const query = gql`
  query {
    stats
  }
`

export default graphql(query)

import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

const query = gql`
  query {
    competitors {
      id
      source
      originalUrl
      address
      price
      size
      numRooms
      kitchenType
      ownershipType
      flatCondition
      constructionType
      floorNum
      basement
      coords
      downtownDistance
      addressPath
    }
  }
`

export default graphql(query)

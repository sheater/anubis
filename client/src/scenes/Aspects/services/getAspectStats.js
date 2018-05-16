import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

const query = gql`
  query ($key: String) {
    aspectStats (aspectKey: $key) {
      items {
        adapterId
        isUndefinedPossible
        possibleValues {
          count
          content
        }
      }
    }
  }
`

const options = (props) => {
  return {
    variables: {
      key: props.item.key
    }
  }
}

export default graphql(query, { options })

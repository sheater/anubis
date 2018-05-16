import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

const query = gql`
  query ($attributes: scalar) {
    evaluate (attributes: $attributes) {
      estimatedPrice
      competitors
    }
  }
`

export default graphql(query, {
  props: ({ ownProps, mutate }) => ({
    evaluate: ({ attributes }) => mutate({
      variables: { attributes },
      // optimisticResponse: {
      //   __typename: 'Mutation',
      //   removeScrape: {
      //     __typename: 'Scrape',
      //     id,
      //   }
      // },
      update: (proxy, { data }) => {
        console.log('data', data)
        // const data = proxy.readQuery({ query: miningQuery })
        // const index = data.scrapes.findIndex(x => x.id === removeScrape.id)
        //
        // if (index >= 0) {
        //   data.scrapes.splice(index, 1)
        // }
        //
        // proxy.writeQuery({ query: miningQuery, data })
      }
    })
  })
  // options: (props) => {
  //   return {
  //     variables: {
  //       adapter: props.match.params.adapter
  //     }
  //   }
  // }
})

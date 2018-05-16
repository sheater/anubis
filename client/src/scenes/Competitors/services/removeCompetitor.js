import { graphql } from "react-apollo/index"
import gql from "graphql-tag"

import listAll from './listAll'

const removeCompetitor = graphql(gql`
  mutation ($id: ID!) {
    removeCompetitor (id: $id) {
      id,
      source
    }
  }
`, {
  props: ({ ownProps, mutate }) => ({
    removeCompetitor: ({ id }) => mutate({
      variables: { id },
      update: (proxy, { data: { removeCompetitor } }) => {
        const data = proxy.readQuery({ query: listAll })
        const index = data.competitors.findIndex(x => x.id === removeCompetitor.id)

        if (index >= 0) {
          data.competitors.splice(index, 1)
        }

        proxy.writeQuery({ query: listAll, data })
      }
    })
  })
})

export default removeCompetitor

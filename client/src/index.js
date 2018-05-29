import React from "react"
import ReactDOM from "react-dom"
import { HashRouter as Router } from "react-router-dom"
import ApolloClient from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from "react-apollo"

import Root from './scenes/Root'

const apollo = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4000/graphql' }),
  cache: new InMemoryCache(),
})

const Main = () => (
  <Router>
    <ApolloProvider client={apollo}>
      <Root />
    </ApolloProvider>
  </Router>
)

ReactDOM.render(<Main />, document.getElementById('root'))

import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { HashRouter as Router } from "react-router-dom"
import { PersistGate } from "redux-persist/lib/integration/react"
import ApolloClient from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from "react-apollo"

import { store, persistor } from './services/store'
import Root from './scenes/Root'

const apollo = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4000/graphql' }),
  cache: new InMemoryCache(),
})

class Main extends React.Component {
  render () {
    return (
      <Router>
        <Provider store={store}>
          <ApolloProvider client={apollo}>
            <PersistGate loading={null} persistor={persistor}>
              <Root />
            </PersistGate>
          </ApolloProvider>
        </Provider>
      </Router>
    )
  }
}

ReactDOM.render(<Main />, document.getElementById('root'))

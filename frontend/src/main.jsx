import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { BrowserRouter as Router } from 'react-router-dom'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import './index.css'
import App from './App.jsx'

// Hardcoded to point directly to your live Render backend
const HTTP_URL = 'https://sync-jqrt.onrender.com/graphql';
const WS_URL = 'wss://sync-jqrt.onrender.com/graphql';

// Create a WebSocket link — passes auth token via connectionParams
const wsLink = new GraphQLWsLink(createClient({
  url: WS_URL,
  connectionParams: () => {
    const token = localStorage.getItem('token');
    return token ? { authorization: `Bearer ${token}` } : {};
  },
}))

// Set up the authentication link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// Create an HTTP link
const httpLink = new HttpLink({
  uri: HTTP_URL
});

// Split links based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

// Create Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <Router>
        <App />
      </Router>
    </ApolloProvider>
  </StrictMode>,
)
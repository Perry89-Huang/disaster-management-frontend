import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { HelmetProvider } from 'react-helmet-async'
import { apolloClient } from './lib/apolloClient'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
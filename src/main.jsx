import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './lib/apolloClient'
import AdminApp from './pages/AdminApp.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <AdminApp />
    </ApolloProvider>
  </React.StrictMode>,
)
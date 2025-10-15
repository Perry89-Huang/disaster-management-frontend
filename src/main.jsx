import React from 'react'
import ReactDOM from 'react-dom/client'
import { NhostProvider } from '@nhost/react'
import { NhostApolloProvider } from '@nhost/react-apollo'
import { HelmetProvider } from 'react-helmet-async'
import { nhost } from './lib/nhost'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </NhostApolloProvider>
    </NhostProvider>
  </React.StrictMode>,
)
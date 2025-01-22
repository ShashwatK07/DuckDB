// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';
// import './index.css';
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import { Auth0Provider } from '@auth0/auth0-react';


// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// if (!PUBLISHABLE_KEY) {
//   throw new Error("Missing Publishable Key")
// }

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     {/* <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}> */}
//     {/* <Auth0Provider
//       domain="dev-iwr6t4pvqz4d2bbh.us.auth0.com"
//       clientId="yE1OE8sZh0AkRg4oML5wuwEJdQ0q1n9C"
//       authorizationParams={{
//         redirect_uri: window.location.origin
//       }} */}
//     ><App />
//     {/* </Auth0Provider> */}

//     {/* </GoogleOAuthProvider> */}
//   </React.StrictMode>
// );


import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
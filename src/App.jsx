import { useState } from 'react'
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Initialize Amplify
Amplify.configure({
  Auth: {
    region: 'ap-south-1', // e.g., 'us-east-1'
    userPoolId: 'ap-south-1_dZWoKMzXu',
    userPoolWebClientId: '4b5u7ulkblckblnc4u4bj2dicl',
    oauth: {
      domain: 'notesapp-auth.auth.ap-south-1.amazoncognito.com',  // Your Cognito domain
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'https://main.dztext8cxpd8m.amplifyapp.com/',
      redirectSignOut: 'https://main.dztext8cxpd8m.amplifyapp.com/',
      responseType: 'code'
    }
  }
});

function App({ signOut, user }) {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Welcome, {user.username}!</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
        <button onClick={signOut}>Sign Out</button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default withAuthenticator(App);

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function Auth() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1>Welcome {user.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </Authenticator>
  );
}

export default Auth; 
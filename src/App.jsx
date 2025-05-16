// App.js

import { useAuth } from "react-oidc-context";
import S3Manager from "./s3manager.tsx";

function App() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "4b5u7ulkblckblnc4u4bj2dicl";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://ap-south-1dzwokmzxu.auth.ap-south-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <h1>Welcome {auth.user?.profile.email}</h1>
        <S3Manager idToken={auth.user?.id_token} />
        <button onClick={() => auth.removeUser()}>Sign out</button>
      </div>
    );
  }

  return <button onClick={() => auth.signinRedirect()}>Log in</button>;
}

export default App;
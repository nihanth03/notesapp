import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import S3Manager from './s3manager.tsx'
import { AuthProvider, useAuth } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_dZWoKMzXu",
  client_id: "4b5u7ulkblckblnc4u4bj2dicl",
  redirect_uri: "https://main.dztext8cxpd8m.amplifyapp.com/test-s3",
  response_type: "code",
  scope: "email openid phone",
};

// Test component for S3Manager
function TestS3Manager() {
  const auth = useAuth();

  const handleLogout = () => {
    const clientId = "4b5u7ulkblckblnc4u4bj2dicl";
    const logoutUri = "https://main.dztext8cxpd8m.amplifyapp.com/";
    const cognitoDomain = "https://ap-south-1dzwokmzxu.auth.ap-south-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  return (
    <div>
      <h1>S3 Manager Test Page</h1>
      <S3Manager idToken={auth.user?.id_token} />
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleLogout} style={{ marginRight: '10px' }}>Logout</button>
        <Link to="/">Back to Main App</Link>
      </div>
    </div>
  );
}

// Navigation component
function Nav() {
  return (
    <div style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
      <Link to="/" style={{ marginRight: '20px' }}>Main App</Link>
      <Link to="/test-s3">Test S3 Manager</Link>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider {...cognitoAuthConfig}>
        <Nav />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/test-s3" element={<TestS3Manager />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

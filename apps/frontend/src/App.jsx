// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import GoogleCallback from './pages/GoogleCallback';
import NotFound from './pages/NotFound';
import MainLayout from './components/MainLayout';

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading....</div>;// Or a nice loading spinner
  }

  if (!isAuthenticated) {
    // Redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <MainLayout>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />

      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/room/:roomId" 
        element={
          <ProtectedRoute>
            <Room />
          </ProtectedRoute>
        } 
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </MainLayout>
  );
}

export default App;
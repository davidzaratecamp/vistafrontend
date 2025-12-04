import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import Layout from './Layout/Layout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const isAuth = checkAuth();
    console.log('ProtectedRoute - isAuthenticated:', isAuth);
  }, [checkAuth]);

  console.log('ProtectedRoute render - isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    console.log('Redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
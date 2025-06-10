import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAdmin }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" />;
  
};

export default ProtectedRoute;
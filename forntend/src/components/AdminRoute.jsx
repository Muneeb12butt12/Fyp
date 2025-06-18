import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/signin" />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default AdminRoute;
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Home from './Home';

const BuyerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="relative">
      <Home />
    </div>
  );
};

export default BuyerDashboard; 
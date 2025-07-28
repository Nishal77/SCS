import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import StaffDashboardMain from '../pages/staff/index';

// Staff route protection component
const ProtectedStaffRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      console.log('[DEBUG] StaffDashboard: Checking session...');
      const userSession = localStorage.getItem('user_session');
      console.log('[DEBUG] StaffDashboard: user_session from localStorage:', userSession);
      
      if (userSession) {
        try {
          const sessionData = JSON.parse(userSession);
          console.log('[DEBUG] StaffDashboard: Parsed sessionData:', sessionData);
          
          if (sessionData && sessionData.id) {
            console.log('[DEBUG] StaffDashboard: Session valid, setting authenticated to true');
            setIsAuthenticated(true);
            // Check if user has staff role
            if (sessionData.role === 'staff') {
              console.log('[DEBUG] StaffDashboard: User has staff role, setting isStaff to true');
              setIsStaff(true);
            } else {
              console.log('[DEBUG] StaffDashboard: User does not have staff role, setting isStaff to false');
              setIsStaff(false);
            }
          } else {
            console.log('[DEBUG] StaffDashboard: Session invalid (no id), setting authenticated to false');
            setIsAuthenticated(false);
            setIsStaff(false);
          }
        } catch (error) {
          console.error('[DEBUG] StaffDashboard: Error parsing session:', error);
          setIsAuthenticated(false);
          setIsStaff(false);
        }
      } else {
        console.log('[DEBUG] StaffDashboard: No user_session found, setting authenticated to false');
        setIsAuthenticated(false);
        setIsStaff(false);
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

const StaffDashboardWrapper = () => (
  <ProtectedStaffRoute>
    <StaffDashboardMain />
  </ProtectedStaffRoute>
);

export default StaffDashboardWrapper; 
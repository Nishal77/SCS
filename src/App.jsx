import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import UserDashboard from './routes/UserDashboard'
import StaffDashboard from './routes/StaffDashboard'
import Contact from './pages/user/contact.jsx'
import Cart from './pages/user/cart.jsx'
import Order from './pages/user/order.jsx'
import Login from './pages/auth/Login.jsx'

// Session check component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const userSession = localStorage.getItem('user_session');
      if (userSession) {
        try {
          const sessionData = JSON.parse(userSession);
          if (sessionData && sessionData.id) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error parsing session:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
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

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/user/contact" element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        } />
        <Route path="/user/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/user/order" element={
          <ProtectedRoute>
            <Order />
          </ProtectedRoute>
        } />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/sign-up" element={<Login />} />
        <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  )
}

export default App

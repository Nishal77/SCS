import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from './components/ui/button'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import UserDashboard from './routes/UserDashboard'
import Contact from './pages/user/contact.jsx'
import Cart from './pages/user/cart.jsx'
import Order from './pages/user/order.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/contact" element={<Contact />} />
        <Route path="/user/cart" element={<Cart />} />
        <Route path="/user/order" element={<Order />} />
        <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  )
}

export default App

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from './components/ui/button'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import UserDashboard from './routes/UserDashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  )
}

export default App

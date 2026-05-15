import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VendeurDashboard from './pages/VendeurDashboard';
import AcheteurDashboard from './pages/AcheteurDashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vendeur" element={<VendeurDashboard />} />
          <Route path="/acheteur" element={<AcheteurDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

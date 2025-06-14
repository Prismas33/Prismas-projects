import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DownloadMind from './components/DownloadMind';
import Login from './components/Login';
import Settings from './components/Settings';
import UploadMind from './components/UploadMind';

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/download-mind" element={<DownloadMind />} />
        <Route path="/upload-mind" element={<UploadMind />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </Router>
  );
};

export default App;

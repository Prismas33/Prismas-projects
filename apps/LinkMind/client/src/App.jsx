import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import UploadMind from './components/UploadMind';
import DownloadMind from './components/DownloadMind';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-mind" element={<UploadMind />} />
        <Route path="/download-mind" element={<DownloadMind />} />
      </Routes>
    </Router>
  );
};

export default App;

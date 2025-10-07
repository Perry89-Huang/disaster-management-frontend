// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AdminApp from './pages/AdminApp';
import VolunteerApp from './pages/VolunteerApp';

export default function App() {
  return (
    <BrowserRouter basename="/superman">  {/* 🔑 設置 basename */}
      <Routes>
        <Route path="/" element={<AdminApp />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/volunteer" element={<VolunteerApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-6xl font-bold text-gray-800 mb-4">花蓮縣光復救災資源管理系統</h2>
        <p className="text-xl text-gray-600 mb-8">....</p>
        <div className="space-x-4">
          <Link 
            to="/admin" 
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition"
          >
            管理員端
          </Link>
          <Link 
            to="/volunteer" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            志工端
          </Link>
        </div>
      </div>
    </div>
  );
}
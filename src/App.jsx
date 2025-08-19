import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import MessagePage from './pages/MessagePage.jsx'
import CameraPage from './pages/CameraPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AlbumPage from './pages/AlbumPage.jsx'
import NayeonPage from './pages/AdminPage.jsx'

export default function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/message" element={<MessagePage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/nayeon" element={<AdminPage />} />
        <Route path="/album" element={<AlbumPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

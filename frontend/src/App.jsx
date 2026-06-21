import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScheduleProvider } from './context/ScheduleContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ReminderSystem from './components/ReminderSystem';
import VoiceCommand from './components/VoiceCommand';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Schedules from './pages/Schedules';
import CalendarView from './pages/CalendarView';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <ReminderSystem />
      <VoiceCommand />
      <PWAInstallPrompt />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/schedules" element={
              <PrivateRoute>
                <Layout>
                  <Schedules />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/calendar" element={
              <PrivateRoute>
                <Layout>
                  <CalendarView />
                </Layout>
              </PrivateRoute>
            } />

            {/* Add other protected routes here */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </ScheduleProvider>
    </AuthProvider>
  );
}

export default App;

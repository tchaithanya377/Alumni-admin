import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import SidebarAdmin from './components/Navbar';  // Correctly named import
import UserManagement from './components/UserManagement';
import PostManagement from './components/PostManagement';
import EventManagement from './components/EventManagement';
import AnnouncementManagement from './components/AnnouncementsAndNews';
import AnalyticsAndReports from './components/AnalyticsAndReports';
import Login from './components/Login';

function App() {
  const handleLogout = () => {
    // Handle logout functionality
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <SidebarAdmin onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/posts" element={<PostManagement />} />
                <Route path="/events" element={<EventManagement />} />
                <Route path="/announcements" element={<AnnouncementManagement />} />
                <Route path="/analytics" element={<AnalyticsAndReports />} />
              </Routes>
            </SidebarAdmin>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

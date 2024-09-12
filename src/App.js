import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase'; // Import Firebase config
import { doc, getDoc } from 'firebase/firestore'; // Firestore functions
import AdminDashboard from './components/AdminDashboard';
import SidebarAdmin from './components/Navbar';
import UserManagement from './components/UserManagement';
import PostManagement from './components/PostManagement';
import EventManagement from './components/EventManagement';
import AnnouncementManagement from './components/AnnouncementsAndNews';
import AnalyticsAndReports from './components/AnalyticsAndReports';
import Login from './components/Login';
import GalleryManagement from './components/GalleryManagement';
import SponsorManagement from './components/AddSponsorPage';

function ProtectedAdminRoute({ element }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user info from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);  // User is an admin
        } else {
          setIsAdmin(false); // User is not an admin
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;  // Show a loading screen while checking
  }

  return isAdmin ? element : <Navigate to="/login" />;  // Only allow access if the user is an admin
}

function App() {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/*"
          element={
            <ProtectedAdminRoute
              element={
                <SidebarAdmin onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/posts" element={<PostManagement />} />
                    <Route path="/events" element={<EventManagement />} />
                    <Route path="/announcements" element={<AnnouncementManagement />} />
                    <Route path="/analytics" element={<AnalyticsAndReports />} />
                    <Route path="/gallery" element={<GalleryManagement />} />
                    <Route path="/sponsor" element={<SponsorManagement />} />
                  </Routes>
                </SidebarAdmin>
              }
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

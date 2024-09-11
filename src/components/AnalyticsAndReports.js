import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Import your Firebase configuration
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaFileDownload } from 'react-icons/fa'; // Icon for download

const AnalyticsAndReports = () => {
  const [userStats, setUserStats] = useState({ totalUsers: 0, activeUsers: 0 });
  const [postStats, setPostStats] = useState({ totalPosts: 0, jobs: 0, events: 0 });
  const [eventStats, setEventStats] = useState({ totalEvents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch total users and active users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      const activeUsers = usersSnapshot.docs.filter(doc => doc.data().lastActive).length; // Assuming 'lastActive' field
      setUserStats({ totalUsers, activeUsers });

      // Fetch total posts, jobs, and events
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const totalPosts = postsSnapshot.size;
      const jobs = postsSnapshot.docs.filter(doc => doc.data().postType === 'job').length;
      const events = postsSnapshot.docs.filter(doc => doc.data().postType === 'event').length;
      setPostStats({ totalPosts, jobs, events });

      // Fetch total events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const totalEvents = eventsSnapshot.size;
      setEventStats({ totalEvents });

      setLoading(false);
    };

    fetchStats();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // User engagement pie chart data
  const userData = [
    { name: 'Active Users', value: userStats.activeUsers },
    { name: 'Inactive Users', value: userStats.totalUsers - userStats.activeUsers },
  ];

  // Post distribution bar chart data
  const postData = [
    { name: 'Jobs', count: postStats.jobs },
    { name: 'Events', count: postStats.events },
    { name: 'Total Posts', count: postStats.totalPosts },
  ];

  const downloadReport = () => {
    // You can implement report generation logic here, e.g., download CSV or PDF file with stats.
    alert('Download report functionality not yet implemented.');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Analytics & Reports</h1>

      {/* User Engagement Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">User Engagement</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={userData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {userData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Post Distribution Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Post Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={postData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Total Events */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Event Statistics</h2>
        <p className="text-lg">Total Events: <strong>{eventStats.totalEvents}</strong></p>
      </div>

      {/* Download Report Button */}
      <div className="text-center">
        <button
          onClick={downloadReport}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          <FaFileDownload className="inline-block mr-2" /> Download Report
        </button>
      </div>
    </div>
  );
};

export default AnalyticsAndReports;

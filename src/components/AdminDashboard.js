// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Your Firebase configuration
import { FaUser, FaClipboardList, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'; // Recharts for charts

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      // Fetch total users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      setTotalUsers(usersSnapshot.size);

      // Fetch active users (Assume active users have a specific field or activity timestamp)
      const activeUsersSnapshot = await getDocs(collection(db, 'users')); // Replace with active user logic
      setActiveUsers(activeUsersSnapshot.size); // Example: size of active users

      // Fetch total posts
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      setTotalPosts(postsSnapshot.size);

      // Fetch total events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      setTotalEvents(eventsSnapshot.size);
    };

    fetchMetrics();
  }, []);

  // Chart Data for user engagement
  const data = [
    { name: 'Active Users', value: activeUsers },
    { name: 'Inactive Users', value: totalUsers - activeUsers },
  ];

  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
          <FaUser className="text-primary text-4xl" />
          <div>
            <h3 className="text-2xl font-bold">{totalUsers}</h3>
            <p className="text-gray-600">Total Users</p>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
          <FaChartLine className="text-primary text-4xl" />
          <div>
            <h3 className="text-2xl font-bold">{activeUsers}</h3>
            <p className="text-gray-600">Active Users</p>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
          <FaClipboardList className="text-primary text-4xl" />
          <div>
            <h3 className="text-2xl font-bold">{totalPosts}</h3>
            <p className="text-gray-600">Total Posts</p>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
          <FaCalendarAlt className="text-primary text-4xl" />
          <div>
            <h3 className="text-2xl font-bold">{totalEvents}</h3>
            <p className="text-gray-600">Total Events</p>
          </div>
        </div>
      </div>

      {/* User Engagement Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
        <h2 className="text-2xl font-bold mb-4">User Engagement</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;

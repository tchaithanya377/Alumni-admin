// src/components/SidebarAdmin.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUser, FaChartLine, FaClipboardList, FaCalendarAlt, FaImages, FaBullhorn, FaFileAlt, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SidebarAdmin = ({ onLogout, children }) => {
  const [isOpen, setIsOpen] = useState(true); // State to toggle sidebar

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`bg-primary text-white min-h-screen transition-all ${isOpen ? 'w-64' : 'w-16'} duration-300`}>
        <div className="flex items-center justify-between p-4">
          <h1 className={`font-bold text-2xl ${isOpen ? 'block' : 'hidden'}`}>Admin Panel</h1>
          <button onClick={toggleSidebar}>
            {isOpen ? <FaTimes className="text-white text-2xl" /> : <FaBars className="text-white text-2xl" />}
          </button>
        </div>

        <nav className="mt-10 space-y-2">
          <NavLink to="/" className="flex items-center p-3 hover:bg-secondary rounded">
            <FaChartLine className="mr-3" />
            {isOpen && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/users" className="flex items-center p-3 hover:bg-secondary rounded">
            <FaUser className="mr-3" />
            {isOpen && <span>User Management</span>}
          </NavLink>
          <NavLink to="/posts" className="flex items-center p-3 hover:bg-secondary rounded">
            <FaClipboardList className="mr-3" />
            {isOpen && <span>Posts Management</span>}
          </NavLink>
          <NavLink to="/events" className="flex items-center p-3 hover:bg-secondary rounded">
            <FaCalendarAlt className="mr-3" />
            {isOpen && <span>Event Management</span>}
          </NavLink>
          <NavLink to="/gallery" className="flex items-center p-3 hover:bg-secondary rounded">
            <FaImages className="mr-3" />
            {isOpen && <span>Gallery Management</span>}
          </NavLink>
          <NavLink to="/announcements" className="flex items-center p-3 hover:bg-secondary rounded">
            <FaBullhorn className="mr-3" />
            {isOpen && <span>Announcements & News</span>}
          </NavLink>
          <NavLink to="/analytics" className="flex items-center p-3 hover:bg-secondary rounded">
            <FaFileAlt className="mr-3" />
            {isOpen && <span>Analytics & Reports</span>}
          </NavLink>

          {/* Logout Button (Below Reports Section) */}
          <div className="mt-4">
            <button
              onClick={onLogout}
              className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 mx-3"
              style={{ width: 'fit-content' }}
            >
              <FaSignOutAlt className="mr-2" />
              {isOpen && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content (Children passed from parent) */}
      <div className="flex-1 p-6 bg-gray-100">
        {children}
      </div>
    </div>
  );
};

export default SidebarAdmin;

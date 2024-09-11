import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Firebase configuration
import { FaEdit, FaTrash, FaSearch, FaEye, FaCheck, FaTimes } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // To manage the selected user for the popup
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup open/close state
  const [editingUser, setEditingUser] = useState(null); // Manage editing state
  const [updatedData, setUpdatedData] = useState({}); // Store updated user data

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
      setFilteredUsers(usersList);
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Handle showing the popup modal with user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsPopupOpen(true);
  };

  // Handle closing the popup modal
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedUser(null);
    setEditingUser(null);
  };

  // Handle editing user details
  const handleEditUser = () => {
    setEditingUser(true);
    setUpdatedData(selectedUser);
  };

  // Handle saving the user details after editing
  const handleSave = async () => {
    const userDocRef = doc(db, 'users', selectedUser.id);
    await updateDoc(userDocRef, updatedData);
    setUsers(users.map(user => (user.id === selectedUser.id ? updatedData : user)));
    setSelectedUser(updatedData);
    setEditingUser(null);
  };

  // Handle deleting a user
  const handleDelete = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.id !== userId)); // Remove the user from local state
      setFilteredUsers(filteredUsers.filter(user => user.id !== userId)); // Update the filtered list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* Search bar */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <button className="ml-2 bg-primary text-white px-4 py-2 rounded-lg">
          <FaSearch />
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.fullName || 'N/A'}</td>
                <td className="px-4 py-2">{user.collegeMail || 'N/A'}</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Detail Popup Modal */}
      {isPopupOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">User Details</h2>

            {/* Profile Photo */}
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={selectedUser.profilePhotoURL || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-bold">{selectedUser.fullName}</h3>
                <p>{selectedUser.collegeMail}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <p><strong>Country:</strong> {editingUser ? <input type="text" value={updatedData.country} onChange={(e) => setUpdatedData({ ...updatedData, country: e.target.value })} className="border p-2 rounded" /> : selectedUser.country || 'N/A'}</p>
              <p><strong>Degree:</strong> {editingUser ? <input type="text" value={updatedData.degree} onChange={(e) => setUpdatedData({ ...updatedData, degree: e.target.value })} className="border p-2 rounded" /> : selectedUser.degree || 'N/A'}</p>
              <p><strong>Department:</strong> {editingUser ? <input type="text" value={updatedData.department} onChange={(e) => setUpdatedData({ ...updatedData, department: e.target.value })} className="border p-2 rounded" /> : selectedUser.department || 'N/A'}</p>
              <p><strong>Employment:</strong> {editingUser ? <input type="text" value={updatedData.employment} onChange={(e) => setUpdatedData({ ...updatedData, employment: e.target.value })} className="border p-2 rounded" /> : selectedUser.employment || 'N/A'}</p>
              <p><strong>Graduation Year:</strong> {editingUser ? <input type="text" value={updatedData.graduationYear} onChange={(e) => setUpdatedData({ ...updatedData, graduationYear: e.target.value })} className="border p-2 rounded" /> : selectedUser.graduationYear || 'N/A'}</p>
              <p><strong>Job Location:</strong> {editingUser ? <input type="text" value={updatedData.jobLocation} onChange={(e) => setUpdatedData({ ...updatedData, jobLocation: e.target.value })} className="border p-2 rounded" /> : selectedUser.jobLocation || 'N/A'}</p>
              <p><strong>Permanent Location:</strong> {editingUser ? <input type="text" value={updatedData.permanentLocation} onChange={(e) => setUpdatedData({ ...updatedData, permanentLocation: e.target.value })} className="border p-2 rounded" /> : selectedUser.permanentLocation || 'N/A'}</p>
              <p><strong>Phone:</strong> {editingUser ? <input type="text" value={updatedData.phone} onChange={(e) => setUpdatedData({ ...updatedData, phone: e.target.value })} className="border p-2 rounded" /> : selectedUser.phone || 'N/A'}</p>
              <p><strong>Personal Mail:</strong> {editingUser ? <input type="text" value={updatedData.personalMail} onChange={(e) => setUpdatedData({ ...updatedData, personalMail: e.target.value })} className="border p-2 rounded" /> : selectedUser.personalMail || 'N/A'}</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              {editingUser ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    <FaCheck /> Save
                  </button>
                  <button
                    onClick={closePopup}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    <FaTimes /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEditUser}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={closePopup}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    <FaTimes /> Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

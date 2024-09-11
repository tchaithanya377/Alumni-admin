import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Firebase configuration
import { FaEdit, FaTrash, FaSearch, FaEye, FaCheck, FaTimes } from 'react-icons/fa';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null); // To manage the selected post for the popup
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup open/close state
  const [editingPost, setEditingPost] = useState(false); // Manage editing state
  const [updatedData, setUpdatedData] = useState({}); // Store updated post data

  // Fetch posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const postsList = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsList);
      setFilteredPosts(postsList);
    };

    fetchPosts();
  }, []);

  // Filter posts based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        (post?.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (post?.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  // Handle showing the popup modal with post details
  const handleViewPost = (post) => {
    setSelectedPost(post);
    setIsPopupOpen(true);
    setEditingPost(false); // Reset editing state when opening a new post
  };

  // Handle closing the popup modal
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedPost(null);
    setEditingPost(false);
  };

  // Handle editing post details
  const handleEditPost = () => {
    setEditingPost(true);
    setUpdatedData(selectedPost); // Initialize updatedData with the selected post data
  };

  // Handle saving the post details after editing
  const handleSave = async () => {
    if (!selectedPost?.id) return; // Ensure the post ID exists before updating
    const postDocRef = doc(db, 'posts', selectedPost.id);
    
    try {
      await updateDoc(postDocRef, updatedData);
      setPosts(posts.map(post => (post.id === selectedPost.id ? { ...post, ...updatedData } : post)));
      setSelectedPost({ ...selectedPost, ...updatedData });
      setEditingPost(false); // Turn off editing mode after saving
      setIsPopupOpen(false); // Close the modal after saving
    } catch (error) {
      console.error("Error updating post: ", error);
    }
  };

  // Handle updating fields while editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData({ ...updatedData, [name]: value });
  };

  // Handle deleting a post
  const handleDelete = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(posts.filter(post => post.id !== postId)); // Remove the post from local state
      setFilteredPosts(filteredPosts.filter(post => post.id !== postId)); // Update the filtered list
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Post Management</h1>

      {/* Search bar */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <button className="ml-2 bg-primary text-white px-4 py-2 rounded-lg">
          <FaSearch />
        </button>
      </div>

      {/* Posts table */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Description</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map(post => (
              <tr key={post?.id} className="border-t">
                <td className="px-4 py-2">{post?.title || 'N/A'}</td>
                <td className="px-4 py-2">{post?.description || 'N/A'}</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewPost(post)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleViewPost(post)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(post?.id)}
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

      {/* Post Detail Popup Modal */}
      {isPopupOpen && selectedPost && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Post Details</h2>

            {/* Post Info */}
            <div className="space-y-2">
              <p><strong>Title:</strong> {editingPost ? <input type="text" name="title" value={updatedData?.title || ''} onChange={handleInputChange} className="border p-2 rounded" /> : selectedPost?.title || 'N/A'}</p>
              <p><strong>Description:</strong> {editingPost ? <textarea name="description" value={updatedData?.description || ''} onChange={handleInputChange} className="border p-2 rounded" /> : selectedPost?.description || 'N/A'}</p>
              <p><strong>Posted By:</strong> {selectedPost?.fullName || 'Anonymous'}</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              {editingPost ? (
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
                    onClick={handleEditPost}
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

export default PostManagement;

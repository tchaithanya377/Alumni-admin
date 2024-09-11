import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase'; // Import Firebase configuration
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';

const AnnouncementsAndNews = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', description: '' });
  const [newImage, setNewImage] = useState(null); // For new image upload
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedAnnouncement, setUpdatedAnnouncement] = useState({});
  const [updatedImage, setUpdatedImage] = useState(null); // For updating image

  // Fetch announcements and news from Firestore
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const announcementsSnapshot = await getDocs(collection(db, 'announcements'));
      const announcementList = announcementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnnouncements(announcementList);
    };

    fetchAnnouncements();
  }, []);

  // Handle opening the announcement popup
  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsPopupOpen(true);
    setIsEditing(false); // Reset editing state
  };

  // Handle closing the popup modal
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedAnnouncement(null);
    setIsEditing(false);
  };

  // Handle adding a new announcement with image upload
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();

    let imageUrl = '';
    if (newImage) {
      const imageRef = ref(storage, `announcements/${newImage.name}`);
      const uploadTask = uploadBytesResumable(imageRef, newImage);
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => reject(error),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              imageUrl = url;
              resolve();
            });
          }
        );
      });
    }

    try {
      const announcementData = {
        ...newAnnouncement,
        imageUrl,
      };
      const docRef = await addDoc(collection(db, 'announcements'), announcementData);
      setAnnouncements([...announcements, { id: docRef.id, ...announcementData }]);
      setNewAnnouncement({ title: '', description: '' }); // Reset form
      setNewImage(null); // Reset image input
    } catch (error) {
      console.error('Error adding announcement: ', error);
    }
  };

  // Handle editing announcement
  const handleEditAnnouncement = () => {
    setIsEditing(true);
    setUpdatedAnnouncement(selectedAnnouncement); // Initialize updatedAnnouncement with selected announcement data
  };

  // Handle saving edited announcement with image upload
  const handleSaveAnnouncement = async () => {
    if (!selectedAnnouncement?.id) return;
    let updatedImageUrl = selectedAnnouncement.imageUrl || '';

    if (updatedImage) {
      const imageRef = ref(storage, `announcements/${updatedImage.name}`);
      const uploadTask = uploadBytesResumable(imageRef, updatedImage);
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => reject(error),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              updatedImageUrl = url;
              resolve();
            });
          }
        );
      });
    }

    const announcementDocRef = doc(db, 'announcements', selectedAnnouncement.id);
    try {
      const updatedAnnouncementData = {
        ...updatedAnnouncement,
        imageUrl: updatedImageUrl,
      };
      await updateDoc(announcementDocRef, updatedAnnouncementData);
      setAnnouncements(
        announcements.map(announcement =>
          announcement.id === selectedAnnouncement.id
            ? { ...announcement, ...updatedAnnouncementData }
            : announcement
        )
      );
      setSelectedAnnouncement({ ...selectedAnnouncement, ...updatedAnnouncementData });
      setIsEditing(false); // Disable editing mode
      setIsPopupOpen(false); // Close the modal
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  // Handle input change during editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedAnnouncement({ ...updatedAnnouncement, [name]: value });
  };

  // Handle deleting an announcement
  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
      setAnnouncements(announcements.filter(announcement => announcement.id !== announcementId)); // Update the state after deletion
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Announcements & News Management</h1>

      {/* Add New Announcement Form */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Add New Announcement</h2>
        <form onSubmit={handleAddAnnouncement} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Description"
              value={newAnnouncement.description}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Upload Image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} />
          </div>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
            <FaPlus /> Add Announcement
          </button>
        </form>
      </div>

      {/* Announcement List */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">All Announcements & News</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map(announcement => (
              <tr key={announcement.id} className="border-t">
                <td className="px-4 py-2">{announcement.title}</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewAnnouncement(announcement)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                      <FaEdit /> View/Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Announcement Popup */}
      {isPopupOpen && selectedAnnouncement && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold mb-4">Announcement Details</h2>
            <div>
              {selectedAnnouncement.imageUrl && (
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt="Announcement"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <p><strong>Title:</strong> {selectedAnnouncement.title}</p>
              <p><strong>Description:</strong> {selectedAnnouncement.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveAnnouncement}
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
                    onClick={handleEditAnnouncement}
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

export default AnnouncementsAndNews;

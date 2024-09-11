import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase'; // Firebase configuration
import { FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '' });
  const [newImage, setNewImage] = useState(null); // For new image upload
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedEvent, setUpdatedEvent] = useState({});
  const [updatedImage, setUpdatedImage] = useState(null); // For updating image

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventList = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
    };

    fetchEvents();
  }, []);

  // Handle opening the event popup
  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsPopupOpen(true);
    setIsEditing(false); // Reset editing state
  };

  // Handle closing the popup modal
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedEvent(null);
    setIsEditing(false);
  };

  // Handle adding a new event with image upload
  const handleAddEvent = async (e) => {
    e.preventDefault();

    let imageUrl = '';
    if (newImage) {
      const imageRef = ref(storage, `events/${newImage.name}`);
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
      const eventData = {
        ...newEvent,
        imageUrl,
      };
      await addDoc(collection(db, 'events'), eventData);
      setEvents([...events, eventData]);
      setNewEvent({ title: '', description: '', date: '', location: '' }); // Reset form
      setNewImage(null); // Reset image input
    } catch (error) {
      console.error('Error adding event: ', error);
    }
  };

  // Handle editing event
  const handleEditEvent = () => {
    setIsEditing(true);
    setUpdatedEvent(selectedEvent); // Initialize updatedEvent with selected event data
  };

  // Handle saving edited event with image upload
  const handleSaveEvent = async () => {
    if (!selectedEvent?.id) return;
    let updatedImageUrl = selectedEvent.imageUrl || '';

    if (updatedImage) {
      const imageRef = ref(storage, `events/${updatedImage.name}`);
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

    const eventDocRef = doc(db, 'events', selectedEvent.id);
    try {
      const updatedEventData = {
        ...updatedEvent,
        imageUrl: updatedImageUrl,
      };
      await updateDoc(eventDocRef, updatedEventData);
      setEvents(events.map(event => (event.id === selectedEvent.id ? { ...event, ...updatedEventData } : event)));
      setSelectedEvent({ ...selectedEvent, ...updatedEventData });
      setIsEditing(false); // Disable editing mode
      setIsPopupOpen(false); // Close the modal
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  // Handle input change during editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedEvent({ ...updatedEvent, [name]: value });
  };

  // Handle deleting an event
  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents(events.filter(event => event.id !== eventId)); // Update the state after deletion
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Event Management</h1>

      {/* Add New Event Form */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Add New Event</h2>
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Event Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Event Location"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Upload Event Image</label>
            <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} />
          </div>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
            <FaPlus /> Add Event
          </button>
        </form>
      </div>

      {/* Event List */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">All Events</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Location</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id} className="border-t">
                <td className="px-4 py-2">{event.title}</td>
                <td className="px-4 py-2">{event.date}</td>
                <td className="px-4 py-2">{event.location}</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewEvent(event)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
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

      {/* Event Popup */}
      {isPopupOpen && selectedEvent && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold mb-4">Event Details</h2>
            <div>
              {selectedEvent.imageUrl && (
                <img
                  src={selectedEvent.imageUrl}
                  alt="Event"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <p><strong>Title:</strong> {selectedEvent.title}</p>
              <p><strong>Description:</strong> {selectedEvent.description}</p>
              <p><strong>Date:</strong> {selectedEvent.date}</p>
              <p><strong>Location:</strong> {selectedEvent.location}</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEvent}
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
                    onClick={handleEditEvent}
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

export default EventManagement;

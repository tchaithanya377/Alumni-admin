// src/components/GalleryManagement.jsx

import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase'; // Your Firebase config
import { FaTrashAlt, FaCloudUploadAlt } from 'react-icons/fa';

const GalleryManagement = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch gallery items from Firestore
    const fetchGalleryItems = async () => {
      const gallerySnapshot = await getDocs(collection(db, 'gallery'));
      const galleryList = gallerySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGalleryItems(galleryList);
    };
    fetchGalleryItems();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !title || !description) {
      alert('Please fill all fields.');
      return;
    }
    
    setUploading(true);
    const storageRef = ref(storage, `gallery/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Add uploaded file details to Firestore
    await addDoc(collection(db, 'gallery'), {
      title,
      description,
      fileUrl: downloadURL,
      fileName: file.name,
      fileType: file.type.includes('video') ? 'video' : 'image',
      timestamp: new Date(),
    });

    // Refresh the gallery items
    const gallerySnapshot = await getDocs(collection(db, 'gallery'));
    const galleryList = gallerySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setGalleryItems(galleryList);

    // Clear fields after upload
    setFile(null);
    setTitle('');
    setDescription('');
    setUploading(false);
  };

  const handleDelete = async (item) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // Delete from storage
      const storageRef = ref(storage, `gallery/${item.fileName}`);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'gallery', item.id));

      // Refresh gallery items
      const updatedGallery = galleryItems.filter(galleryItem => galleryItem.id !== item.id);
      setGalleryItems(updatedGallery);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Gallery Management</h1>

      {/* Upload Section */}
      <div className="mb-6">
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="mb-4" 
        />
        <input 
          type="text" 
          placeholder="Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)} 
          className="mb-4 border p-2 w-full"
        />
        <textarea 
          placeholder="Description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)} 
          className="mb-4 border p-2 w-full"
        ></textarea>
        <button
          onClick={handleUpload}
          className={`px-4 py-2 bg-blue-500 text-white rounded ${uploading ? 'opacity-50' : ''}`}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : <FaCloudUploadAlt className="inline mr-2" />}
          Upload
        </button>
      </div>

      {/* Gallery Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {galleryItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
            {item.fileType === 'image' ? (
              <img src={item.fileUrl} alt={item.fileName} className="rounded-lg w-full" />
            ) : (
              <video controls className="rounded-lg w-full">
                <source src={item.fileUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <div className="mt-2">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <p className="text-sm">{item.fileName}</p>
              <button onClick={() => handleDelete(item)} className="text-red-500">
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryManagement;

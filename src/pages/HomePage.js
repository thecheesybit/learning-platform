import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Navbar from '../components/Shared/Navbar';
import studyImage from '../assets/images/study.gif';
import "../styles/global.css"; // Ensure this contains dark theme styles
import "../styles/homePage.css";

// Helper function to convert URLs in text to clickable links
const createClickableLinks = (text) => {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return text.split(urlPattern).map((part, index) => 
    urlPattern.test(part) ? <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : part
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulletins, setBulletins] = useState([]);
  const [newBulletin, setNewBulletin] = useState({ title: '', message: '', image: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'user-data', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);

          if (data.banned) {
            navigate('/banned');
          } else if (!data.approved) {
            navigate('/waiting-for-approval');
          }
        } else {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }

      setLoading(false);
    };

    fetchUserData();
  }, [auth.currentUser, db, navigate]);

  useEffect(() => {
    const bulletinRef = collection(db, 'bulletin');
    const unsubscribe = onSnapshot(bulletinRef, (snapshot) => {
      const bulletinData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBulletins(bulletinData);
    });

    return () => unsubscribe();
  }, [db]);

  const handleBulletinChange = (e) => {
    const { name, value } = e.target;
    setNewBulletin(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1024 * 1024) { // 1MB
      setImageFile(file);
      setNewBulletin(prevState => ({
        ...prevState,
        image: file.name
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('File size must be less than 1MB');
    }
  };

  const handleAddBulletin = async () => {
    try {
      let imageUrl = '';
      if (imageFile) {
        const imageRef = ref(storage, `bulletins/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'bulletin'), {
        ...newBulletin,
        image: imageUrl,
        timestamp: new Date()
      });

      setNewBulletin({ title: '', message: '', image: '' });
      setImagePreview('');
      setImageFile(null);
    } catch (error) {
      console.error('Error adding bulletin:', error);
    }
  };

  const handleDeleteBulletin = async (id, imageUrl) => {
    try {
      await deleteDoc(doc(db, 'bulletin', id));
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error('Error deleting bulletin:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="home-page-container">
      <Navbar />
      <div className="home-page-content">
        <div className="learning-portal">
          <h1>Learning Portal</h1>
          <img src={studyImage} alt="Study" className="study-image" />
        </div>
        <div className="bulletin-board">
          <h1>Bulletin Board</h1>
          <div className="bulletin-marquee">
            <ul className="bulletin-list">
              {bulletins.map(bulletin => (
                <li key={bulletin.id} className="bulletin-item">
                  <div className="bulletin-content">
                    <p><strong>{bulletin.title}</strong></p>
                    <p>{createClickableLinks(bulletin.message)}</p> {/* Convert URLs to links */}
                    {bulletin.image && (
                      <div>
                        <img src={bulletin.image} alt={bulletin.title} className="bulletin-image" />
                        <button onClick={() => window.open(bulletin.image, '_blank')} className="view-image-button">View Image</button>
                      </div>
                    )}
                    <p className="bulletin-date">{new Date(bulletin.timestamp?.toDate()).toLocaleDateString()}</p>
                  </div>
                  {(userData.role === 'teacher' || userData.role === 'admin') && (
                    <button className="delete-button" onClick={() => handleDeleteBulletin(bulletin.id, bulletin.image)}>Delete</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {(userData.role === 'teacher' || userData.role === 'admin') && (
          <div className="bulletin-form-section">
            <div className="bulletin-form">
              <h2>Add Bulletin</h2>
              <input
                type="text"
                name="title"
                value={newBulletin.title}
                onChange={handleBulletinChange}
                placeholder="Title"
              />
              <textarea
                name="message"
                value={newBulletin.message}
                onChange={handleBulletinChange}
                placeholder="Message"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
              <button onClick={handleAddBulletin}>Add Bulletin</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

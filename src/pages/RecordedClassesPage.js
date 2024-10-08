import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { firestore, auth } from '../firebase'; // Adjust path as necessary
// eslint-disable-next-line no-unused-vars
import { collection, setDoc, getDoc, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import ReactPlayer from 'react-player';
import './RecordedClassesPage.css'; // Ensure you have this file for CSS
import { useNavigate } from "react-router-dom";

const RecordedClassesPage = () => {
  const [user] = useAuthState(auth);
  const [videoData, setVideoData] = useState([]);
  const [newVideo, setNewVideo] = useState({ link: '', subject: '' });
  const [error, setError] = useState('');
  const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDoc = doc(firestore, 'user-data', user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const role = userSnapshot.data().role;
          setIsTeacherOrAdmin(role === 'teacher' || role === 'admin');
        }
      }
    };

    fetchUserRole();
  }, [user]);

  // Fetch video data
  useEffect(() => {
    const videoQuery = query(collection(firestore, 'recorded-classes'));
    const unsubscribe = onSnapshot(videoQuery, (snapshot) => {
      const videos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVideoData(videos);
    });

    return () => unsubscribe();
  }, []);

  // Handle new video form changes
  const handleVideoChange = (e) => {
    const { name, value } = e.target;
    setNewVideo((prev) => ({ ...prev, [name]: value }));
  };

  // Upload video
  const handleUploadVideo = async () => {
    if (!newVideo.link || !newVideo.subject) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'recorded-classes'), {
        ...newVideo,
        uploadTime: new Date(),
      });

      setNewVideo({ link: '', subject: '' });
      setError('');
    } catch (err) {
      setError('Error uploading video: ' + err.message);
    }
  };

  // Handle video play
  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
  };

  // Handle close video
  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  // Handle delete video
  const handleDeleteVideo = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'recorded-classes', id));
    } catch (err) {
      setError('Error deleting video: ' + err.message);
    }
  };

  return (
    <div className="recorded-classes-page">
      <header>
        <h1>Recorded Classes</h1>
        <button className="go-back-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </header>
      {selectedVideo && (
        <div className="video-modal">
          <button className="close-button" onClick={handleCloseVideo}>Close</button>
          <ReactPlayer
            url={selectedVideo.link}
            controls
            width="100%"
            height="100%"
          />
        </div>
      )}
      {isTeacherOrAdmin && (
        <div className="upload-form">
          <h2>Upload New Video</h2>
          <div className="form-field">
            <input
              type="text"
              name="link"
              value={newVideo.link}
              onChange={handleVideoChange}
              placeholder="Video Link (YouTube/Google Drive)"
            />
          </div>
          <div className="form-field">
            <input
              type="text"
              name="subject"
              value={newVideo.subject}
              onChange={handleVideoChange}
              placeholder="Subject/Title"
            />
          </div>
          <button onClick={handleUploadVideo}>Upload Video</button>
          {error && <p className="error">{error}</p>}
        </div>
      )}
      <div className="video-list">
        {videoData.map((video) => (
          <div key={video.id} className="video-item">
            <h3>{video.subject}</h3>
            <p>Uploaded on: {new Date(video.uploadTime.seconds * 1000).toLocaleDateString()}</p>
            {user ? (
              <div>
                <button onClick={() => handlePlayVideo(video)}>Play Video</button>
              </div>
            ) : (
              <p>Log in to watch videos</p>
            )}
            {isTeacherOrAdmin && (
              <button className="delete-button" onClick={() => handleDeleteVideo(video.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordedClassesPage;

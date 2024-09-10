import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { firestore, auth, storage } from "../firebase"; // Import Firestore, Auth, and Storage
import {
  collection,
  addDoc,
  getDoc,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import "./StudentDashboard.css";

function StudentDashboard() {
  // eslint-disable-next-line no-unused-vars
  const [user, loading, error] = useAuthState(auth);
  const [doubts, setDoubts] = useState([]);
  const [newDoubt, setNewDoubt] = useState({
    subject: "",
    text: "",
    image: null,
    audio: "",
  });
  const [audioURL, setAudioURL] = useState("");
  const [recording, setRecording] = useState(false);
  const [errorMsg, setError] = useState("");
  const [userDetails, setUserDetails] = useState({ name: "", phoneNumber: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userDoc = doc(firestore, "user-data", user.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            setUserDetails({
              name: userSnapshot.data().name,
              phoneNumber: userSnapshot.data().phone,
            });
          }
        } catch (err) {
          console.error("Error fetching user data: ", err.message);
        }
      };

      fetchUserData();

      const doubtsQuery = query(
        collection(firestore, "student-doubt"),
        where("uid", "==", user.uid)
      );

      const unsubscribe = onSnapshot(doubtsQuery, (snapshot) => {
        const fetchedDoubts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoubts(fetchedDoubts);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleDoubtChange = (e) => {
    const { name, value } = e.target;
    setNewDoubt((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1024 * 1024) {
      // 1MB limit
      setNewDoubt((prev) => ({ ...prev, image: file }));
    } else {
      alert("Image must be less than 1MB.");
    }
  };

  const handleAudioStart = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser doesn't support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setNewDoubt((prev) => ({ ...prev, audio: audioUrl }));
        audioChunksRef.current = [];
      };

      setRecording(true);
      mediaRecorder.start();
    } catch (error) {
      alert("Error accessing microphone: " + error.message);
    }
  };

  const handleAudioStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handlePostDoubt = async () => {
    if (
      !newDoubt.subject ||
      (!newDoubt.text && !newDoubt.image && !newDoubt.audio)
    ) {
      setError(
        "Subject and at least one of Text, Image, or Audio is required."
      );
      return;
    }

    if (window.confirm("Are you sure you want to post this doubt?")) {
      try {
        let imageURL = "";
        let audioURL = "";

        if (newDoubt.image) {
          const imageRef = ref(storage, `images/${newDoubt.image.name}`);
          await uploadBytes(imageRef, newDoubt.image);
          imageURL = await getDownloadURL(imageRef);
        }

        if (newDoubt.audio) {
          // Convert audio URL to Blob
          const audioBlob = await fetch(newDoubt.audio).then((res) =>
            res.blob()
          );
          const audioRef = ref(
            storage,
            `audios/${Date.now()}_${newDoubt.audio.split("/").pop()}`
          );
          await uploadBytes(audioRef, audioBlob);
          audioURL = await getDownloadURL(audioRef);
        }

        await addDoc(collection(firestore, "student-doubt"), {
          subject: newDoubt.subject,
          text: newDoubt.text,
          image: imageURL,
          audio: audioURL,
          uid: user.uid,
          timestamp: new Date(),
          status: "Unresolved",
        });

        setNewDoubt({ subject: "", text: "", image: null, audio: "" });
        setAudioURL("");
        setError("");
      } catch (err) {
        setError("Error posting doubt: " + err.message);
      }
    }
  };

  const handleDeleteDoubt = async (id, imageURL, audioURL) => {
    if (window.confirm("Are you sure you want to delete this doubt?")) {
      try {
        // Delete image and audio files from Firebase Storage
        if (imageURL) {
          const imageRef = ref(storage, imageURL);
          await deleteObject(imageRef);
        }

        if (audioURL) {
          const audioRef = ref(storage, audioURL);
          await deleteObject(audioRef);
        }

        // Delete the doubt document from Firestore
        await deleteDoc(doc(firestore, "student-doubt", id));
      } catch (err) {
        alert("Error deleting doubt: " + err.message);
      }
    }
  };

  const handleImageClick = (imageURL) => {
    setSelectedImage(imageURL);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // Function to render text with clickable links
  const renderTextWithLinks = (text) => {
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  return (
    <div className="student-dashboard-container">
      <div className="header">
        <h1>Student Dashboard</h1>
        <button className="go-back-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>

      <div className="dashboard-content">
        <div className="post-doubt-section">
          <h2>Post Your Doubt</h2>
          {errorMsg && <p className="error-text">{errorMsg}</p>}
          <input
            type="text"
            name="subject"
            placeholder="Enter Subject"
            value={newDoubt.subject}
            onChange={handleDoubtChange}
          />
          <textarea
            name="text"
            placeholder="Describe your doubt"
            value={newDoubt.text}
            onChange={handleDoubtChange}
          />
          <div>
            <label>Upload your image (Max 1MB):</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <div>
            <label>Record audio (Max 1 minute):</label>
            {!recording ? (
              <button onClick={handleAudioStart}>Record Audio</button>
            ) : (
              <button onClick={handleAudioStop}>Stop Recording</button>
            )}
            {audioURL && <audio controls src={audioURL} />}
          </div>
          <button onClick={handlePostDoubt}>Confirm and Post Doubt</button>
        </div>

        <div className="your-doubts-section">
          <h2>Your Doubts</h2>
          {doubts.length === 0 ? (
            <p>No doubts posted yet.</p>
          ) : (
            doubts.map((doubt) => (
              <div
                key={doubt.id}
                className="doubt-item"
                style={{
                  backgroundColor:
                    doubt.status === "Unresolved"
                      ? "rgba(255, 0, 0, 0.1)"
                      : "rgba(0, 255, 0, 0.1)",
                }}
              >
                <div className="doubt-header">
                  <h3>{doubt.subject}</h3>
                  <button
                    className="toggle-button"
                    onClick={() => {
                      const element = document.getElementById(doubt.id);
                      if (
                        element.style.display === "none" ||
                        element.style.display === ""
                      ) {
                        element.style.display = "block";
                      } else {
                        element.style.display = "none";
                      }
                    }}
                  >
                    {document.getElementById(doubt.id)?.style.display === "none"
                      ? "Expand"
                      : "Collapse"}
                  </button>
                </div>
                <div
                  id={doubt.id}
                  className="doubt-content"
                  style={{ display: "none" }}
                >
                  <p>{renderTextWithLinks(doubt.text)}</p>
                  {doubt.image && (
                    <div>
                      <img
                        src={doubt.image}
                        alt="Doubt"
                        className="doubt-image"
                        onClick={() => handleImageClick(doubt.image)}
                      />
                    </div>
                  )}
                  {doubt.audio && <audio controls src={doubt.audio} />}
                  <p>
                    Submitted by: {userDetails.name || "Loading..."} (
                    {userDetails.phoneNumber || "Loading..."})
                  </p>
                  <p>
                    Submitted on:{" "}
                    {new Date(doubt.timestamp.toDate()).toLocaleString()}
                  </p>
                  <p>Status: {doubt.status}</p>
                  {doubt.status === "Unresolved" ? (
                    <button
                      onClick={() =>
                        handleDeleteDoubt(doubt.id, doubt.image, doubt.audio)
                      }
                    >
                      Delete Doubt
                    </button>
                  ) : (
                    <div>
                      <h4>Comments by Teacher:</h4>
                      {/* Render teacher comments here */}
                      <p>{doubt.teacherComments?.text || "No comments yet"}</p>
                      {doubt.teacherComments?.image && (
                        <img
                          src={doubt.teacherComments.image}
                          alt="Teacher Comment"
                        />
                      )}
                      {doubt.teacherComments?.audio && (
                        <audio controls src={doubt.teacherComments.audio} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={handleCloseImage}>
          <img src={selectedImage} alt="Doubt" className="modal-image" />
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;

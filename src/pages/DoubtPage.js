import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { firestore, auth, storage } from "../firebase";
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
import "./doubtPage.css"; // Ensure this path is correct

const DoubtPage = () => {
  const [user, loading, error] = useAuthState(auth);
  const [doubts, setDoubts] = useState([]);
  const [addressDoubt, setAddressDoubt] = useState({
    selectedDoubtId: "",
    remarks: "",
  });
  const [audioURL, setAudioURL] = useState("");
  const [recording, setRecording] = useState(false);
  const [errorMsg, setError] = useState("");
  const [userDetails, setUserDetails] = useState({ name: "", phoneNumber: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [allDoubts, setAllDoubts] = useState([]);
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

      const userDoubtsQuery = query(
        collection(firestore, "student-doubt"),
        where("uid", "==", user.uid)
      );

      const allDoubtsQuery = query(collection(firestore, "student-doubt"));

      const unsubscribeUserDoubts = onSnapshot(userDoubtsQuery, (snapshot) => {
        const fetchedDoubts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoubts(fetchedDoubts);
      });

      const unsubscribeAllDoubts = onSnapshot(allDoubtsQuery, (snapshot) => {
        const fetchedAllDoubts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllDoubts(fetchedAllDoubts);
      });

      return () => {
        unsubscribeUserDoubts();
        unsubscribeAllDoubts();
      };
    }
  }, [user]);

  useEffect(() => {
    console.log("Fetched doubts: ", doubts);
  }, [doubts]);

  const handleAddressDoubtChange = (e) => {
    const { name, value } = e.target;
    setAddressDoubt((prev) => ({ ...prev, [name]: value }));
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

  const handleResolveDoubt = async () => {
    if (!addressDoubt.selectedDoubtId || !addressDoubt.remarks) {
      setError("Please select a doubt and add remarks.");
      return;
    }

    if (window.confirm("Are you sure you want to resolve this doubt?")) {
      try {
        const doubtDoc = doc(
          firestore,
          "student-doubt",
          addressDoubt.selectedDoubtId
        );
        await addDoc(doubtDoc, {
          teacherComments: {
            text: addressDoubt.remarks,
          },
          status: "Resolved",
        });
        setAddressDoubt({ selectedDoubtId: "", remarks: "" });
        setError("");
      } catch (err) {
        setError("Error resolving doubt: " + err.message);
      }
    }
  };

  const handleDeleteDoubt = async (id, imageURL, audioURL) => {
    if (window.confirm("Are you sure you want to delete this doubt?")) {
      try {
        if (imageURL) {
          const imageRef = ref(storage, imageURL);
          await deleteObject(imageRef);
        }

        if (audioURL) {
          const audioRef = ref(storage, audioURL);
          await deleteObject(audioRef);
        }

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

  const renderTextWithLinks = (text) => {
    if (!text) return null; // Return null if text is not provided
  
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
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
        <h1>Doubt Dashboard</h1>
      </div>

      <div className="dashboard-content">
        <div className="post-doubt-section">
          <h2>Address Doubt</h2>
          {errorMsg && <p className="error-text">{errorMsg}</p>}
          <div>
            <label>Select Doubt:</label>
            <select
              name="selectedDoubtId"
              value={addressDoubt.selectedDoubtId}
              onChange={handleAddressDoubtChange}
            >
              <option value="">Select an unresolved doubt</option>
              {doubts.length > 0 ? (
                doubts
                  .filter((doubt) => doubt.status === "Unresolved")
                  .map((doubt) => (
                    <option key={doubt.id} value={doubt.id}>
                      {doubt.subject}
                    </option>
                  ))
              ) : (
                <option value="">No doubts available</option>
              )}
            </select>
          </div>
          <div>
            <label>Add Remarks:</label>
            <textarea
              name="remarks"
              placeholder="Add remarks for the doubt"
              value={addressDoubt.remarks}
              onChange={handleAddressDoubtChange}
            />
          </div>
          <button onClick={handleResolveDoubt}>Resolve Doubt</button>
          <div>
            <button onClick={recording ? handleAudioStop : handleAudioStart}>
              {recording ? "Stop Recording" : "Start Recording"}
            </button>
            {audioURL && (
              <audio controls>
                <source src={audioURL} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        </div>

        <div className="post-doubt-section">
          <h2>Doubt Section</h2>
          {allDoubts.length === 0 ? (
            <p>No doubts posted yet.</p>
          ) : (
            allDoubts.map((doubt) => (
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
                    {doubt.status === "Unresolved"
                      ? "Expand"
                      : "Collapse"}
                  </button>
                </div>
                <div
                  id={doubt.id}
                  style={{ display: "none" }}
                  className="doubt-content"
                >
                  <p>{renderTextWithLinks(doubt.description)}</p>
                  {doubt.imageURL && (
                    <img
                      src={doubt.imageURL}
                      alt="Doubt"
                      onClick={() => handleImageClick(doubt.imageURL)}
                    />
                  )}
                  {doubt.audioURL && (
                    <audio controls>
                      <source src={doubt.audioURL} type="audio/mp3" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  <div>
                    <span>Submitted by: {doubt.uid}</span>
                  </div>
                  {doubt.status === "Resolved" && (
                    <div className="teacher-comments">
                      <h4>Comments by Teacher:</h4>
                      <p>{doubt.teacherComments?.text}</p>
                    </div>
                  )}
                  <button onClick={() => handleDeleteDoubt(doubt.id, doubt.imageURL, doubt.audioURL)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedImage && (
          <div className="image-overlay" onClick={handleCloseImage}>
            <img src={selectedImage} alt="Doubt" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoubtPage;

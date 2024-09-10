import React, { useState, useEffect, useRef } from "react";
import { firestore, auth, storage } from "../firebase";
import {
  collection,
  updateDoc,
  getDoc,
  query,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import "./doubtPage.css";

const DoubtPage = () => {
  const [user] = useAuthState(auth);
  const [doubts, setDoubts] = useState([]);
  const [addressDoubt, setAddressDoubt] = useState({
    selectedDoubtId: "",
    remarks: "",
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
  const [imageFile, setImageFile] = useState(null);

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

      const allDoubtsQuery = query(collection(firestore, "student-doubt"));

      const unsubscribeAllDoubts = onSnapshot(allDoubtsQuery, (snapshot) => {
        const fetchedAllDoubts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoubts(fetchedAllDoubts);
      });

      return () => {
        unsubscribeAllDoubts();
      };
    }
  }, [user]);

  const handleAddressDoubtChange = (e) => {
    const { name, value } = e.target;
    setAddressDoubt((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1024 * 1024) {
      setImageFile(file); // Set the image file for upload
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
        setAddressDoubt((prev) => ({ ...prev, audio: audioUrl }));
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

  const handleDeleteDoubt = async (id, imageURL, audioURL) => {
    if (window.confirm("Are you sure you want to delete this doubt?")) {
      try {
        // If an image URL is associated with the doubt, delete the image from storage
        if (imageURL) {
          const imageRef = ref(storage, imageURL);
          await deleteObject(imageRef);
        }
  
        // If an audio URL is associated with the doubt, delete the audio file from storage
        if (audioURL) {
          const audioRef = ref(storage, audioURL);
          await deleteObject(audioRef);
        }
  
        // Delete the doubt document from Firestore
        await deleteDoc(doc(firestore, "student-doubt", id));
        alert("Doubt deleted successfully.");
      } catch (err) {
        console.error("Error deleting doubt: ", err.message);
        alert("Failed to delete doubt.");
      }
    }
  };
  
  const uploadImageToStorage = async (imageFile) => {
    if (!imageFile) return null;

    const storageRef = ref(storage, `doubt-images/${Date.now()}-${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  // const uploadAudioToStorage = async (audioBlob) => {
  //   if (!audioBlob) return null;

  //   const storageRef = ref(storage, `doubt-audio/${Date.now()}.mp3`);
  //   const snapshot = await uploadBytes(storageRef, audioBlob);
  //   const downloadURL = await getDownloadURL(snapshot.ref);
  //   return downloadURL;
  // };

  const handleResolveDoubt = async () => {
    if (!addressDoubt.selectedDoubtId || !addressDoubt.remarks) {
      setError("Please select a doubt and add remarks.");
      return;
    }

    const selectedDoubtRef = doc(firestore, "student-doubt", addressDoubt.selectedDoubtId);

    if (window.confirm("Are you sure you want to resolve this doubt?")) {
      try {
        const imageUrl = await uploadImageToStorage(imageFile);
        let audioUrl = null;

        if (addressDoubt.audio) {
          const audioBlob = await fetch(addressDoubt.audio).then((res) =>
            res.blob()
        );
        const audioRef = ref(
          storage,
          `audios/${Date.now()}_${addressDoubt.audio.split("/").pop()}`
        );
        await uploadBytes(audioRef, audioBlob);
        audioUrl = await getDownloadURL(audioRef);
      }

        await updateDoc(selectedDoubtRef, {
          "teacherComments.text": addressDoubt.remarks,
          "teacherComments.image": imageUrl || null,
          "teacherComments.audio": audioUrl || null,
          status: "Resolved",
        });

        // Reset state after resolving the doubt
        setAddressDoubt({ selectedDoubtId: "", remarks: "" });
        setImageFile(null);
        setAudioURL("");
        alert("Doubt resolved successfully!");
      } catch (err) {
        console.error("Error resolving doubt: ", err.message);
        setError("Error resolving doubt: " + err.message);
      }
    }
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
                <option value="">No unresolved doubts available</option>
              )}
            </select>
          </div>
          <div>
            <br />
            <label>Add Remarks:</label>
            <textarea
              name="remarks"
              placeholder="Add remarks for the doubt"
              value={addressDoubt.remarks}
              onChange={handleAddressDoubtChange}
            />
          </div>
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
          <button onClick={handleResolveDoubt}>Resolve Doubt</button>
        </div>

        <div className="post-doubt-section">
          <h2>Doubt Section</h2>
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
                    {doubt.status === "Unresolved" ? "Expand" : "Collapse"}
                  </button>
                </div>
                <div
                  id={doubt.id}
                  style={{ display: "none" }}
                  className="doubt-content"
                >
                  <p>{doubt.text}</p>
                  {doubt.image && (
                    <img
                      src={doubt.image}
                      alt="Doubt"
                      className="doubt-image"
                      onClick={() => setSelectedImage(doubt.image)}
                    />
                  )}
                  {doubt.audio && <audio controls src={doubt.audio} />}
                  <div>
                    <p>
                      Submitted by: {doubt.submittedBy || "Unknown"} (
                      {doubt.phone || "Unknown"})
                    </p>
                    <p>
                      Submitted on:{" "}
                      {new Date(doubt.timestamp?.toDate()).toLocaleString()}
                    </p>
                    <p>Status: {doubt.status}</p>
                  </div>
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
                      <h2>Comments by Teacher:</h2>
                      <p>{doubt.teacherComments?.text || "No comments yet"}</p>
                      {doubt.teacherComments?.image && (
                        <img
                          src={doubt.teacherComments.image}
                          alt="Teacher Comment"
                          className="doubt-image"
                          onClick={() => setSelectedImage(doubt.teacherComments.image)}
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
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Doubt" className="modal-image" />
        </div>
      )}
    </div>
  );
};

export default DoubtPage;

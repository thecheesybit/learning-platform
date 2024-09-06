import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import './LiveClassPage.css';

const LiveClassPage = () => {
  const [userRole, setUserRole] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [copyLink, setCopyLink] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async (user) => {
      if (user) {
        const userDoc = doc(firestore, 'user-data', user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        } else {
          console.error('User document does not exist.');
        }
      } else {
        console.error('No user is signed in.');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchUserRole(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const meetingsQuery = query(collection(firestore, 'meetings'), where('status', '==', 'scheduled'));

    const unsubscribe = onSnapshot(meetingsQuery, (snapshot) => {
      const meetingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMeetings(meetingsData);
    });

    return () => unsubscribe();
  }, []);

  const handleJoinMeeting = (meeting) => {
    if (meeting) {
      navigate('/class', { state: { meetingLink: meeting.meetingLink } });
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      await deleteDoc(doc(firestore, 'meetings', meetingId));
    }
  };

  const handleCopyLink = (meetingLink) => {
    const token = 'eyJraWQiOiJ2cGFhcy1tYWdpYy1jb29raWUtNDRkOWIxNDY2Y2I2NDJjMzk3ZjQ1NDI0MWE4ODhiOWUvMTNhZmVkLVNBTVBMRV9BUFAiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJqaXRzaSIsImlzcyI6ImNoYXQiLCJpYXQiOjE3MjU2MDI0OTQsImV4cCI6MTcyNTYwOTY5NCwibmJmIjoxNzI1NjAyNDg5LCJzdWIiOiJ2cGFhcy1tYWdpYy1jb29raWUtNDRkOWIxNDY2Y2I2NDJjMzk3ZjQ1NDI0MWE4ODhiOWUiLCJjb250ZXh0Ijp7ImZlYXR1cmVzIjp7ImxpdmVzdHJlYW1pbmciOnRydWUsIm91dGJvdW5kLWNhbGwiOnRydWUsInNpcC1vdXRib3VuZC1jYWxsIjpmYWxzZSwidHJhbnNjcmlwdGlvbiI6dHJ1ZSwicmVjb3JkaW5nIjp0cnVlfSwidXNlciI6eyJoaWRkZW4tZnJvbS1yZWNvcmRlciI6ZmFsc2UsIm1vZGVyYXRvciI6dHJ1ZSwibmFtZSI6ImFrODE4MWFjZSIsImlkIjoiYXV0aDB8NjZkOWY3MDJiNTkxNmQ1MGNlYzQ0MDI1IiwiYXZhdGFyIjoiIiwiZW1haWwiOiJhazgxODFhY2VAZ21haWwuY29tIn19LCJyb29tIjoiKiJ9.eWF6Xtzy7izz8rNjbbomUJZBIbZUN4qZNSAxoRlOyxVeG0On_hGF46cRcJuxnsRzXN4F7pJf4Vp7OPBCUGjq1RnyqrsnT467T7MojnIswBUsT9VXmHYdyoq4YHsh1T4laNPyCMtspkfcz7jypE2Gyfh-bXgckDUqr5sa0H8IqPccj7S1nkuk_utrlS7v5ab9bU7I9Vktl3GIDXZ__rqoGjisNfsoeSZip6WqYoprhGV4eLuKpvfg0dwNRFPT9Oa89iwGSKZB8K3Uu_CGYL1iRR2SurRiGgArf-u0u2yKEKLQ7zi_BLgmPp3H-jQzbS4jAlj_HoPwN9o4JD99a8B-Dw';
    //const fullLink = `${meetingLink}?${token}`;
    const fullLink = `${meetingLink}`;
    
    navigator.clipboard.writeText(fullLink).then(() => {
      alert('Meeting link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

  const isMeetingLive = (meeting) => {
    const currentTime = moment();
    const meetingTime = moment(`${meeting.date} ${meeting.time}`);
    const diff = currentTime.diff(meetingTime, 'minutes');

    return diff >= 0 && diff <= 59;
  };

  const isMeetingAvailable = (meeting) => {
    const currentTime = moment();
    const meetingTime = moment(`${meeting.date} ${meeting.time}`);

    return currentTime.isSameOrAfter(meetingTime);
  };

  return (
    <div className="live-class-container">
      <h1 className="live-class-title">Live Classes</h1>
      <ul className="meeting-list">
        {meetings.map((meeting) => (
          <li key={meeting.id} className="meeting-item">
            <div className="meeting-details">
              <p><strong>Subject:</strong> {meeting.subject}</p>
              <p><strong>Lesson:</strong> {meeting.lesson}</p>
              <p><strong>Date:</strong> {meeting.date}</p>
              <p><strong>Time:</strong> {meeting.time}</p>
              <button
                onClick={() => handleJoinMeeting(meeting)}
                disabled={!isMeetingAvailable(meeting)}
                className={`join-button ${isMeetingLive(meeting) ? 'active' : ''}`}
              >
                {isMeetingLive(meeting) ? 'Join Meeting' : 'Meeting Not Started'}
              </button>
              {(userRole === 'teacher' || userRole === 'admin') && (
                <>
                  <button
                    onClick={() => handleDeleteMeeting(meeting.id)}
                    className="delete-button"
                  >
                    Delete Meeting
                  </button>
                  <button
                    onClick={() => handleCopyLink(meeting.meetingLink)}
                    className="copy-link-button"
                  >
                    Copy Link
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveClassPage;

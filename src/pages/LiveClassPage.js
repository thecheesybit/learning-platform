import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/Shared/LoadingScreen'; // Import LoadingScreen
import './LiveClassPage.css';

const LiveClassPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const meetingsQuery = query(collection(firestore, 'meetings'));

    const unsubscribe = onSnapshot(meetingsQuery, (snapshot) => {
      const meetingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter out past meetings and handle completion status
      const filteredMeetings = meetingsData.filter(meeting => {
        const meetingDateTime = moment(`${meeting.date} ${meeting.time}`);
        const currentDateTime = moment();

        // Check if meeting is past and more than 2 hours ago
        const isMeetingOver = meetingDateTime.isBefore(currentDateTime.subtract(2, 'hours'));
        
        // Check if meeting is complete
        const isMeetingCompleted = meeting.completed;
        
        // Return meetings that are either upcoming or enableForStudents is true
        return (meetingDateTime.isSameOrAfter(currentDateTime) || meeting.enableForStudents) && !isMeetingCompleted;
      });

      setMeetings(filteredMeetings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleJoinMeeting = (meetingLink) => {
    window.open(meetingLink, '_blank');
  };

  return (
    <div className="live-class-page-container">
      {loading ? <LoadingScreen /> : null}
      <button className="go-back-button" onClick={() => navigate('/')}>
        Go Back
      </button>
      <h1 className="live-class-title">Live Classes</h1>

      {loading ? (
        <p>Loading...</p>
      ) : meetings.length === 0 ? (
        <p>No meetings available.</p>
      ) : (
        <div className="live-class-grid">
          {meetings.map((meeting) => {
            const meetingDateTime = moment(`${meeting.date} ${meeting.time}`);
            const currentDateTime = moment();
            const isMeetingOver = meetingDateTime.isBefore(currentDateTime.subtract(2, 'hours'));
            
            return (
              <div key={meeting.id} className="live-class-tile">
                <div className="live-class-details">
                  <p><strong>Subject:</strong> {meeting.subject}</p>
                  <p><strong>Lesson:</strong> {meeting.lesson}</p>
                  <p><strong>Date:</strong> {meeting.date}</p>
                  <p><strong>Time:</strong> {meeting.time}</p>
                  {meeting.completed ? (
                    <p className="meeting-status">Meeting Completed</p>
                  ) : isMeetingOver ? (
                    <p className="meeting-status">Meeting Over</p>
                  ) : (
                    <button
                      className={`join-button ${meeting.enableForStudents ? '' : 'disabled'}`}
                      onClick={() => meeting.enableForStudents && handleJoinMeeting(meeting.meetingLink)}
                      disabled={!meeting.enableForStudents}
                    >
                      {meeting.enableForStudents ? 'Join Meeting' : 'Not Available'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveClassPage;

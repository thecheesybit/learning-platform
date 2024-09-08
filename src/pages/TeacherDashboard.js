import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, addDoc, deleteDoc, query, onSnapshot, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import LoadingScreen from '../components/Shared/LoadingScreen'; // Import LoadingScreen
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [subject, setSubject] = useState('');
  const [lesson, setLesson] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [instantLoading, setInstantLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const meetingsQuery = query(collection(firestore, 'meetings'));

    const unsubscribe = onSnapshot(meetingsQuery, (snapshot) => {
      const meetingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMeetings(meetingsData);
    });

    return () => unsubscribe();
  }, []);

  const generateMeetingLink = (subject, lesson, date) => {
    const token = Math.random().toString(36).substring(2, 15);
    return `https://meet.jit.si/${subject}-${lesson}-${date}-${token}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const meetingLink = generateMeetingLink(subject, lesson, date);

      const meetingData = {
        subject,
        lesson,
        date,
        time,
        meetingLink,
        status: 'scheduled',
        enableForStudents: false,
      };

      await addDoc(collection(firestore, 'meetings'), meetingData);
      alert('Meeting scheduled successfully!');
      setSubject('');
      setLesson('');
      setDate('');
      setTime('');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = (meetingId) => {
    const password = Math.random().toString(36).substring(2, 10);
    navigator.clipboard.writeText(password).then(() => {
      alert('Password copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy password: ', err);
    });
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(firestore, 'meetings', meetingId));
      } catch (error) {
        console.error('Error deleting meeting:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartMeeting = (meetingLink) => {
    window.open(meetingLink, '_blank');
  };

  const handleToggleEnableForStudents = async (meetingId, currentStatus) => {
    setLoading(true);
    try {
      const meetingRef = doc(firestore, 'meetings', meetingId);
      await updateDoc(meetingRef, { enableForStudents: !currentStatus });
      alert(`Meeting ${currentStatus ? 'disabled' : 'enabled'} for students!`);
    } catch (error) {
      console.error('Error toggling meeting for students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantSchedule = async () => {
    setInstantLoading(true);
    try {
      const today = moment().format('YYYY-MM-DD');
      const counterDocRef = doc(firestore, 'counters', today);
      const counterDoc = await getDoc(counterDocRef);

      let lessonNumber = 1;

      if (counterDoc.exists()) {
        lessonNumber = (counterDoc.data().count || 0) + 1;
      }

      const meetingLink = generateMeetingLink('Extra Class', lessonNumber, today);

      const meetingData = {
        subject: 'Extra Class',
        lesson: lessonNumber,
        date: today,
        time: moment().format('HH:mm'),
        meetingLink,
        status: 'scheduled',
        enableForStudents: false,
      };

      await addDoc(collection(firestore, 'meetings'), meetingData);
      await setDoc(counterDocRef, { count: lessonNumber });

      alert('Instant meeting scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling instant meeting:', error);
    } finally {
      setInstantLoading(false);
    }
  };

  return (
    <div className="teacher-dashboard-container">
      {loading || instantLoading ? <LoadingScreen /> : null}
      <button className="go-back-button" onClick={() => navigate('/')}>
        Go Back
      </button>
      <div className="teacher-dashboard-section">
        <h1 className="teacher-dashboard-title">Schedule a New Class</h1>
        <form className="teacher-dashboard-form" onSubmit={handleSubmit}>
          <label>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <label>Lesson Number</label>
          <input
            type="text"
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            required
          />

          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <button type="submit" className="schedule-button" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Meeting'}
          </button>

          <button
            type="button"
            className="instant-schedule-button"
            onClick={handleInstantSchedule}
            disabled={instantLoading}
          >
            {instantLoading ? 'Scheduling...' : 'Instant Schedule'}
          </button>
        </form>
      </div>

      <div className="teacher-dashboard-section">
        <h1 className="teacher-dashboard-title">Meeting Dashboard</h1>
        <ul className="meeting-list">
          {meetings.map((meeting) => (
            <li key={meeting.id} className="meeting-item">
              <div className="meeting-details">
                <p><strong>Subject:</strong> {meeting.subject}</p>
                <p><strong>Lesson:</strong> {meeting.lesson}</p>
                <p><strong>Date:</strong> {meeting.date}</p>
                <p><strong>Time:</strong> {meeting.time}</p>
                <button
                  onClick={() => handleGeneratePassword(meeting.id)}
                  className="generate-password-button"
                >
                  Generate Password
                </button>
                <button
                  onClick={() => handleDeleteMeeting(meeting.id)}
                  className="delete-button"
                >
                  Delete Meeting
                </button>
                <button
                  onClick={() => handleStartMeeting(meeting.meetingLink)}
                  className="start-meeting-button"
                >
                  Start Meeting
                </button>
                <button
                  onClick={() => handleToggleEnableForStudents(meeting.id, meeting.enableForStudents)}
                  className={`toggle-button ${meeting.enableForStudents ? 'enabled' : 'disabled'}`}
                >
                  {meeting.enableForStudents ? 'Disable for Students' : 'Enable for Students'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeacherDashboard;

import React, { useState } from 'react';
import { firestore } from '../firebase'; // Adjust this import according to your Firebase setup
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import './TeacherDashboard.css'; // Import the CSS file

const TeacherDashboard = () => {
  const [subject, setSubject] = useState('');
  const [lesson, setLesson] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const navigate = useNavigate();

  const generateMeetingLink = (subject, lesson, date) => {
    const token = Math.random().toString(36).substring(2, 15);
    return `https://meet.jit.si/${subject}-${lesson}-${date}-${token}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const meetingLink = generateMeetingLink(subject, lesson, date);

      const meetingData = {
        subject,
        lesson,
        date,
        time,
        meetingLink,
        status: 'scheduled',
      };

      // Add meeting to Firestore collection
      await addDoc(collection(firestore, 'meetings'), meetingData);

      alert('Meeting scheduled successfully!');
      navigate('/live-class'); // Redirect to live class page
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };

  return (
    <div className="teacher-dashboard-container">
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

        <button type="submit" className="schedule-button">Schedule Meeting</button>
      </form>
    </div>
  );
};

export default TeacherDashboard;

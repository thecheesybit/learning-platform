import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const TeacherDashboard = () => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const db = getFirestore();

  const handleScheduleMeeting = async () => {
    const meetingUrl = `https://meet.jit.si/${meetingTitle.replace(/\s+/g, '-')}`; // Generate meeting URL
    await addDoc(collection(db, 'meetings'), {
      title: meetingTitle,
      date: meetingDate,
      time: meetingTime,
      url: meetingUrl,
    });
    alert('Meeting scheduled successfully!');
  };

  return (
    <div>
      <h2>Schedule a Meeting</h2>
      <input
        type="text"
        placeholder="Meeting Title"
        value={meetingTitle}
        onChange={(e) => setMeetingTitle(e.target.value)}
      />
      <input
        type="date"
        value={meetingDate}
        onChange={(e) => setMeetingDate(e.target.value)}
      />
      <input
        type="time"
        value={meetingTime}
        onChange={(e) => setMeetingTime(e.target.value)}
      />
      <button onClick={handleScheduleMeeting}>Schedule Meeting</button>
    </div>
  );
};

export default TeacherDashboard;

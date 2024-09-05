import React from 'react';

const MeetingList = ({ meetings, onSelect }) => {
    return (
        <div>
            {meetings.map(meeting => (
                <div key={meeting.roomName} onClick={() => onSelect(meeting)}>
                    <p>{meeting.title}</p>
                </div>
            ))}
        </div>
    );
};

export default MeetingList;

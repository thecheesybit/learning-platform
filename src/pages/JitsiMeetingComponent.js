// src/components/JitsiMeetComponent.js
import React from 'react';
import { JaaSMeeting } from '@jitsi/react-sdk';

const JitsiMeetComponent = ({ roomName, onApiReady, onReadyToClose }) => {
    const handleApiReady = (apiObj) => {
        if (onApiReady) onApiReady(apiObj);
    };

    const handleReadyToClose = () => {
        if (onReadyToClose) onReadyToClose();
    };

    return (
        <div style={{ height: '600px', width: '100%' }}>
            <JaaSMeeting
                roomName={roomName}
                useStaging={false} // Set to true if using JaaS staging environment
                getIFrameRef={(iframeRef) => {
                    if (iframeRef) {
                        iframeRef.style.border = '0';
                        iframeRef.style.width = '100%';
                        iframeRef.style.height = '100%';
                    }
                }}
                configOverwrite={{
                    startWithAudioMuted: true,
                    startWithVideoMuted: true
                }}
                onApiReady={handleApiReady}
                onReadyToClose={handleReadyToClose}
            />
        </div>
    );
};

export default JitsiMeetComponent;

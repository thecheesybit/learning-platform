import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ClassPage = () => {
  const location = useLocation();
  const jitsiContainerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const scriptId = 'jitsi-meet-api-script';

    // Function to load the Jitsi Meet API script
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        setScriptLoaded(true);
        return;
      }

      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://8x8.vc/meet/external_api.js';
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => console.error('Failed to load Jitsi Meet API script');
        document.body.appendChild(script);
      } else {
        setScriptLoaded(true);
      }
    };

    loadJitsiScript();

    return () => {
      // Cleanup script if needed
      const script = document.getElementById(scriptId);
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (scriptLoaded && jitsiContainerRef.current && location.state && location.state.meetingLink) {
      const { meetingLink } = location.state;
      const meetingName = new URL(meetingLink).pathname.substring(1); // Extract meeting name from URL

      const api = new window.JitsiMeetExternalAPI('8x8.vc', {
        roomName: meetingName,
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          disableInviteFunctions: false,
          disableKickFunctions: false,
          requireDisplayName: false,
          hideLobbyButton: true,
          enableLobby: false,
          disableModeration: true,
        },
        interfaceConfigOverwrite: {
          filmStripOnly: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
      });

      return () => {
        api.dispose(); // Cleanup on unmount
      };
    }
  }, [scriptLoaded, location.state]);

  return (
    <div>
      <div ref={jitsiContainerRef} style={{ height: '100vh', width: '100%' }}></div>
    </div>
  );
};

export default ClassPage;

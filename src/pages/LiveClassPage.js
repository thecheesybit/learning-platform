import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebase'; // Adjust this import according to your Firebase setup
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const LiveClassPage = () => {
    const [meetingStarted, setMeetingStarted] = useState(false);
    const [userRole, setUserRole] = useState(null); // Will hold the role fetched from Firestore
    const [meetingStatus, setMeetingStatus] = useState('not_started'); // Default status

    useEffect(() => {
        const fetchUserRole = async (user) => {
            if (user) {
                try {
                    const userDoc = doc(firestore, 'user-data', user.uid);
                    const docSnap = await getDoc(userDoc);
                    if (docSnap.exists()) {
                        setUserRole(docSnap.data().role); // Set user role from Firestore
                    } else {
                        console.error('User document does not exist.');
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                }
            } else {
                console.error('No user is signed in.');
            }
        };

        const fetchMeetingStatus = async () => {
            try {
                const meetingDoc = doc(firestore, 'meetings', 'class-meeting');
                const docSnap = await getDoc(meetingDoc);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMeetingStatus(data.status);
                    setMeetingStarted(data.status === 'started');
                } else {
                    console.error('Meeting document does not exist.');
                }
            } catch (error) {
                console.error('Error fetching meeting status:', error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            fetchUserRole(user);
            fetchMeetingStatus();
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Function to dynamically load the Jitsi API script
        const loadScript = (url, callback) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = callback;
            script.onerror = () => console.error('Error loading script:', url);
            document.body.appendChild(script);
        };

        // Initialize the meeting only after the script has loaded
        const initializeMeeting = () => {
            if (window.JitsiMeetExternalAPI) {
                const api = new window.JitsiMeetExternalAPI("8x8.vc", {
                    roomName: "vpaas-magic-cookie-44d9b1466cb642c397f454241a888b9e/SampleAppImmenseMinutesGraspOften",
                    parentNode: document.querySelector('#jaas-container'),
                    //jwt: "eyJraWQiOiJ2cGFhcy1tYWdpYy1jb29raWUtNDRkOWIxNDY2Y2I2NDJjMzk3ZjQ1NDI0MWE4ODhiOWUvMTNhZmVkLVNBTVBMRV9BUFAiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJqaXRzaSIsImlzcyI6ImNoYXQiLCJpYXQiOjE3MjU1NjA2MjcsImV4cCI6MTcyNTU2NzgyNywibmJmIjoxNzI1NTYwNjIyLCJzdWIiOiJ2cGFhcy1tYWdpYy1jb29raWUtNDRkOWIxNDY2Y2I2NDJjMzk3ZjQ1NDI0MWE4ODhiOWUiLCJjb250ZXh0Ijp7ImZlYXR1cmVzIjp7ImxpdmVzdHJlYW1pbmciOmZhbHNlLCJvdXRib3VuZC1jYWxsIjpmYWxzZSwic2lwLW91dGJvdW5kLWNhbGwiOmZhbHNlLCJ0cmFuc2NyaXB0aW9uIjpmYWxzZSwicmVjb3JkaW5nIjpmYWxzZX0sInVzZXIiOnsiaGlkZGVuLWZyb20tcmVjb3JkZXIiOmZhbHNlLCJtb2RlcmF0b3IiOnRydWUsIm5hbWUiOiJUZXN0IFVzZXIiLCJpZCI6ImF1dGgwfDY2ZDlmNzAyYjU5MTZkNTBjZWM0NDAyNSIsImF2YXRhciI6IiIsImVtYWlsIjoidGVzdC51c2VyQGNvbXBhbnkuY29tIn19LCJyb29tIjoiKiJ9.opFWk1SkHygbGuM9J-Toa0NE3uFW-fD919qbGD6I6kQTJas2uYRt0RGfvA5W3OCY4eCq-mg0vPfzEGDlK4wcM-NvjTINazB6MeOGXenHfCoWgfpThP7nzhi7PFq_b2UfO9gJx1TeieZVu_GYZ527EGbxb3nygzJGLa5j8tQ5gyX3G7R_hDxoMNUp-z7SrqQgWaBP9UD1nyPsQt389TAbHfYZe7E88XK1bA6Ytt_yqLfYg_rYh7DrTOm7W3o2TLpt6C7sj1nziNd_uR0LK3qU2Uwm22xVr3OlFUD7ojk77hlOv1dHCxRMHoRIQT7AvLFenR9ZVWOseGb6MKoeZ6tIkg"
                });
            } else {
                console.error("JitsiMeetExternalAPI is not available.");
            }
        };

        // Load the Jitsi Meet API script
        loadScript('https://8x8.vc/vpaas-magic-cookie-44d9b1466cb642c397f454241a888b9e/external_api.js', () => {
            if ((userRole === 'teacher' || userRole === 'admin') && meetingStarted) {
                initializeMeeting();
            }
        });

        // Cleanup script on component unmount
        return () => {
            const script = document.querySelector('script[src="https://8x8.vc/vpaas-magic-cookie-44d9b1466cb642c397f454241a888b9e/external_api.js"]');
            if (script) {
                document.body.removeChild(script);
            }
        };
    }, [meetingStarted, userRole]);

    const handleStartMeeting = async () => {
        if (userRole === 'teacher' || userRole === 'admin') {
            try {
                // Update meeting status in Firestore
                const meetingDoc = doc(firestore, 'meetings', 'class-meeting');
                await setDoc(meetingDoc, { status: 'started' });
                setMeetingStarted(true);
            } catch (error) {
                console.error('Error starting meeting:', error);
            }
        } else {
            alert("Only teachers and admins can start a meeting.");
        }
    };

    if (userRole === null) {
        return <div>Loading user data...</div>;
    }

    if (userRole === 'user' && meetingStatus === 'not_started') {
        return <div>Meeting is not started yet. Please wait...</div>;
    }

    return (
        <div>
            <h1>Live Class</h1>
            {(userRole === 'teacher' || userRole === 'admin') && !meetingStarted && (
                <button onClick={handleStartMeeting}>Start Meeting</button>
            )}
            <div id="jaas-container" style={{ height: '500px' }} />
        </div>
    );
};

export default LiveClassPage;

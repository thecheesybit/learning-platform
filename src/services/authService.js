// authService.js
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase'; // Import firebaseConfig

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set up persistence
const setAuthPersistence = () => {
  return setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("Persistence set to browser local");
    })
    .catch((error) => {
      console.error('Persistence setting error', error);
    });
};

export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, setAuthPersistence };

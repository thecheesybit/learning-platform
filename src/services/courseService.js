import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase'; // Update with correct path if needed

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };

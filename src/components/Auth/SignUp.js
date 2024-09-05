import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, firestore, setAuthPersistence } from '../../firebase'; // Correct import
import '../../styles/global.css';  // Import global styles
import signupImage from '../../assets/images/signUp.gif'; // Import image
import { useLoading } from '../../context/LoadingContext'; // Import useLoading hook

const SignUp = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading(); // Use loading context

  const handleSignUp = async (e) => {
    e.preventDefault();
    showLoading(); // Show loading screen

    try {
      // Validate phone number format
      if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
        setError('Invalid phone number format');
        hideLoading(); // Hide loading screen
        return;
      }

      // Ensure persistence is set before sign up
      await setAuthPersistence();

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(firestore, 'user-data', user.uid), {
        name,
        phone,
        email,
        role: 'user',  // Default role
        approved: false, // You can adjust this field based on your use case
        authUID: user.uid, // Save the authentication UID
      });

      // Automatically log in the user
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirect to home or desired page
      navigate('/'); 
    } catch (err) {
      setError(err.message);
    } finally {
      hideLoading(); // Hide loading screen
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="form-left">
          <div className="photo-container">
            <img src={signupImage} alt="Sign Up Illustration" />
          </div>
        </div>
        <div className="form-right">
          <h2>Sign Up</h2>
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={handleSignUp} className="form">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign Up</button>
            <p className="login-link">Already registered? <a href="/login">Login</a></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

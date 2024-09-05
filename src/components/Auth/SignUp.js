import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; // Ensure correct import
import '../../styles/global.css';  // Import global styles
import signupImage from '../../assets/images/signUp.gif'; // Import image

const SignUp = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Validate phone number format
      if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
        setError('Invalid phone number format');
        return;
      }
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.message);
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

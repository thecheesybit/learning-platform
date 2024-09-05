import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, setAuthPersistence } from '../../firebase'; // Correct import
import { useLoading } from '../../context/LoadingContext'; // Import useLoading hook
import '../../styles/global.css';  // Import global styles
import loginImage from '../../assets/images/l.gif'; // Import image

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading(); // Access loading functions

  const handleLogin = async (e) => {
    e.preventDefault();
    showLoading(); // Show loading screen
    try {
      // Ensure persistence is set before login
      await setAuthPersistence();

      // Proceed with signing in the user
      await signInWithEmailAndPassword(auth, email, password);
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
            <img src={loginImage} alt="Login Illustration" />
          </div>
        </div>
        <div className="form-right">
          <h2>Login</h2>
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={handleLogin} className="form">
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
            <button type="submit">Login</button>
            <p className="signup-link">Not registered? <a href="/signup">Sign Up</a></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, setAuthPersistence } from '../../firebase'; // Correct import
import { useLoading } from '../../context/LoadingContext'; // Import useLoading hook
import '../../styles/global.css';  // Import global styles
import loginImage from '../../assets/images/l.gif'; // Import image

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false); // State for forgot password view
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

      // Additional logic for managing sessions (e.g., logging out other sessions) can be added here

      navigate('/');
    } catch (err) {
      setError(err.message);
      setForgotPassword(true); // Show forgot password option for any error
    } finally {
      hideLoading(); // Hide loading screen
    }
  };

  const handleForgotPassword = async () => {
    showLoading(); // Show loading screen
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset link sent to your email');
      setForgotPassword(false); // Hide forgot password view
    } catch (err) {
      alert('Error sending password reset email: ' + err.message);
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
          {error && !forgotPassword && <p className="error-text">{error}</p>}
          {!forgotPassword ? (
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
              <p className="forgot-password-link" onClick={() => setForgotPassword(true)}>Forgot your password?</p>
            </form>
          ) : (
            <div className="forgot-password-section">
              <p className="forgot-password-text">Forgot your password?</p>
              <p>Want to receive a password reset link?</p>
              <button onClick={handleForgotPassword}>Send Reset Link</button>
              <button onClick={() => setForgotPassword(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

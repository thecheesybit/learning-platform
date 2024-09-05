import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css'; // Ensure correct path to CSS file
import notFoundImage from '../assets/images/404.gif'; // Ensure correct path to image

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="not-found-container">
      <h1>404 - Page Not Found</h1>
      <img src={notFoundImage} alt="404 Not Found" />
      <p>Redirecting to home page...</p>
    </div>
  );
};

export default NotFound;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LoadingProvider } from './context/LoadingContext'; // Import the LoadingProvider
import './styles/global.css'; // Import global styles if needed

// Create a root container
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component wrapped with the LoadingProvider
root.render(
  <React.StrictMode>
    <LoadingProvider>
      <App />
    </LoadingProvider>
  </React.StrictMode>
);

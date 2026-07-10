import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './AppParkFlowPolished.jsx';
import './styles.css';
import './recs.css';
import './feedback-fixes.css';
import './parklink-map-fixes.css';
import './parklink-final-fixes.css';
import './parklink-polished-picker.css';

try {
  const savedUser = JSON.parse(localStorage.getItem('parklink-user') || 'null');
  if (savedUser && !savedUser.email) {
    localStorage.removeItem('parklink-user');
    sessionStorage.removeItem('parklink-login-otp');
    sessionStorage.removeItem('parklink-pending-user');
  }
} catch {
  localStorage.removeItem('parklink-user');
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

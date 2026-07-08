import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './AppSafe.jsx';
import './styles.css';
import './recs.css';
import './feedback-fixes.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

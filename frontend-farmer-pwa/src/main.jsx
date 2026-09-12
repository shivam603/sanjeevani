import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@kisancred/shared-ui/styles/tokens.css';
import { registerServiceWorker } from './serviceWorkerRegistration.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

registerServiceWorker();

// src/main.jsx
// index.js or main.jsx
window.global = window;
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import AppRouter from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Include JS features

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
    <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
  </React.StrictMode>
);
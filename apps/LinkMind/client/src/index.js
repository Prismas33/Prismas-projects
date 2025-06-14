import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css'; // Importa o CSS diretamente da pasta src

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

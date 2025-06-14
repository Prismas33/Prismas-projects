import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Autentica com Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      // Redireciona para dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>🧠 LinkMind</h1>
        </div>
      </header>
      <main className="login-main">
        <div className="login-box">
          <h2>Entrar</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Entrar</button>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;

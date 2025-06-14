import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Crie este arquivo para os estilos ou importe o CSS global

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Importante para sessões
      });
      if (res.ok) {
        navigate('/dashboard'); // Usar React Router em vez de window.location
      } else {
        const data = await res.json();
        setError(data.error || 'E-mail ou senha inválidos.');
      }
    } catch (err) {
      setError('Erro ao tentar fazer login.');
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

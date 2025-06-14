import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/');
      } else {
        setError(data.error || 'Erro ao cadastrar');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  return (
    <div className="signup-container">
      <h2>Cadastro</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nome" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn-primary" type="submit">Cadastrar</button>
      </form>
      {error && <div className="notification">{error}</div>}
      <p>Já tem conta? <Link to="/">Entrar</Link></p>
    </div>
  );
};

export default Signup;

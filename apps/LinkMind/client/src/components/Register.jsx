import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../firebase-config';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Se já estiver logado, redirecionar para o dashboard
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const syncUserWithBackend = async (user) => {
    try {
      const token = await user.getIdToken();
      await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Erro ao sincronizar utilizador:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Criar conta no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar o perfil com o nome
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Sincronizar com o backend
      await syncUserWithBackend(userCredential.user);

      setSuccess('Conta criada com sucesso! A redirecionar...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Erro no registo:', err);
      let errorMessage = 'Erro ao criar conta.';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este e-mail já está em uso.';
          break;
        case 'auth/weak-password':
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido.';
          break;
        default:
          errorMessage = err.message || 'Erro ao criar conta.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      
      // Sincronizar com o backend
      await syncUserWithBackend(result.user);

      setSuccess('Conta criada com sucesso! A redirecionar...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Erro no registo com Google:', err);
      setError('Erro ao registar com Google.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="register-container">
      <h2>Registo</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Nome" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
          disabled={loading}
        />
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          disabled={loading}
        />
        <input 
          type="password" 
          placeholder="Senha (mínimo 6 caracteres)" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          disabled={loading}
          minLength="6"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'A registar...' : 'Registar'}
        </button>
      </form>
      
      <div className="divider">
        <span>ou</span>
      </div>
      
      <button 
        className="google-btn" 
        onClick={handleGoogleSignUp}
        disabled={loading}
      >
        🚀 Registar com Google
      </button>
      
      <div className="login-link">
        <p>Já tem conta? <a href="/login">Iniciar sessão</a></p>
      </div>
      
      {error && <div style={{color:'red', marginTop:'10px'}}>{error}</div>}
      {success && <div style={{color:'green', marginTop:'10px'}}>{success}</div>}
    </div>
  );
};

export default Register;

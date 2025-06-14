import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profileUrl, setProfileUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulação: buscar dados do usuário
    const uid = localStorage.getItem('uid');
    if (!uid) {
      navigate('/');
      return;
    }
    fetch(`http://localhost:3001/api/user/${uid}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setProfileUrl(data.profileUrl || 'https://www.gravatar.com/avatar?d=mp');
      });
  }, [navigate]);

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="dashboard-container">
      <h2>Bem-vindo, {user.displayName || user.email}!</h2>
      <img src={profileUrl} alt="Foto de perfil" style={{ width: 80, borderRadius: '50%' }} />
      <div style={{ margin: '2em 0' }}>
        <Link to="/upload-mind"><button className="btn-primary">Adicionar Ideia</button></Link>
        <Link to="/download-mind"><button className="btn-secondary" style={{ marginLeft: 10 }}>Buscar Ideia</button></Link>
      </div>
    </div>
  );
};

export default Dashboard;

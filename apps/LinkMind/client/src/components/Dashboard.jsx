import React, { useEffect, useState } from 'react';
import './Dashboard.css'; // Crie este arquivo para os estilos ou importe o CSS global

const Dashboard = () => {
  const [userName, setUserName] = useState('Carregando...');
  const [recentIdeas, setRecentIdeas] = useState(null);

  useEffect(() => {
    // Carregar dados do usuário
    fetch('/api/user')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUserName(data.name))
      .catch(() => (window.location.href = '/'));

    // Carregar ideias recentes
    fetch('/api/ideas?limit=5')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setRecentIdeas(data.ideas))
      .catch(() => setRecentIdeas([]));
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) window.location.href = '/';
    } catch (e) {
      // erro ao fazer logout
    }
  };

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>🧠 LinkMind</h1>
          <div className="user-info">
            <span>{userName}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>Sair</button>
          </div>
        </div>
      </header>
      <main className="dashboard">
        <div className="welcome-section">
          <h2>Bem-vindo de volta!</h2>
          <p>Organize suas ideias e mantenha sua mente conectada.</p>
        </div>
        <div className="actions-grid">
          <div className="action-card">
            <div className="action-icon">💡</div>
            <h3>Adicionar Ideia</h3>
            <p>Capture uma nova inspiração ou projeto</p>
            <a href="/upload-mind" className="btn btn-primary">Nova Ideia</a>
          </div>
          <div className="action-card">
            <div className="action-icon">🔍</div>
            <h3>Buscar Ideias</h3>
            <p>Encontre suas anotações e projetos salvos</p>
            <a href="/download-mind" className="btn btn-primary">Buscar</a>
          </div>
        </div>
        <div className="recent-section">
          <h3>Ideias Recentes</h3>
          <div className="ideas-list">
            {recentIdeas === null ? (
              <div className="loading">Carregando ideias...</div>
            ) : recentIdeas.length === 0 ? (
              <p className="no-ideas">Nenhuma ideia encontrada. Que tal criar a primeira?</p>
            ) : (
              recentIdeas.slice(0, 3).map((idea, idx) => (
                <div className="idea-item" key={idx}>
                  <h4 dangerouslySetInnerHTML={{ __html: escapeHtml(idea.title) }} />
                  <p dangerouslySetInnerHTML={{ __html: escapeHtml(idea.description.substring(0, 100)) + (idea.description.length > 100 ? '...' : '') }} />
                  <small>Criado em: {new Date(idea.createdAt).toLocaleDateString('pt-BR')}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import './DownloadMind.css'; // Crie este arquivo para os estilos ou importe o CSS global

const DownloadMind = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line
  }, []);

  const fetchIdeas = async (searchTerm = '') => {
    setLoading(true);
    setNoResults(false);
    let url = '/api/ideas';
    if (searchTerm) url += `?search=${encodeURIComponent(searchTerm)}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data.ideas);
        setNoResults(data.ideas.length === 0);
      } else {
        setIdeas([]);
        setNoResults(true);
      }
    } catch {
      setIdeas([]);
      setNoResults(true);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    fetchIdeas(search);
  };

  const handleSort = (e) => {
    setSort(e.target.value);
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    if (sort === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1><a href="/dashboard">🧠 LinkMind</a></h1>
          <nav>
            <a href="/dashboard" className="btn btn-secondary">← Voltar</a>
          </nav>
        </div>
      </header>
      <main className="download-mind">
        <div className="search-container">
          <h2>🔎 Buscar Ideias</h2>
          <p>Encontre suas anotações e projetos salvos</p>
          <div className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Digite para buscar suas ideias..."
                autoComplete="off"
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-btn" onClick={handleSearch}>🔎</button>
            </div>
            <div className="search-filters">
              <select value={sort} onChange={handleSort}>
                <option value="recent">Mais Recentes</option>
                <option value="oldest">Mais Antigas</option>
                <option value="title">Por Título</option>
              </select>
            </div>
          </div>
        </div>
        <div className="results-container">
          <div className="ideas-grid">
            {loading ? (
              <div className="loading">Carregando suas ideias...</div>
            ) : noResults ? (
              <div className="no-results">
                <div className="no-results-icon">🗒️</div>
                <h3>Nenhuma ideia encontrada</h3>
                <p>Tente usar palavras-chave diferentes ou <a href="/upload-mind">crie sua primeira ideia</a></p>
              </div>
            ) : (
              sortedIdeas.map(idea => (
                <div className="idea-card" key={idea.id}>
                  <div className="idea-header">
                    <h3 dangerouslySetInnerHTML={{ __html: escapeHtml(idea.title) }} />
                    <div className="idea-actions">
                      <button className="action-btn edit-btn" title="Editar" onClick={() => alert('Funcionalidade de edição em desenvolvimento!')}>✏️</button>
                      <button className="action-btn delete-btn" title="Excluir" onClick={() => alert('Funcionalidade de exclusão em desenvolvimento!')}>🗑️</button>
                    </div>
                  </div>
                  <p className="idea-description" dangerouslySetInnerHTML={{ __html: escapeHtml(idea.description) }} />
                  {(idea.startDate || idea.endDate) && (
                    <div className="idea-dates">
                      {idea.startDate && <span>Início: {formatDate(idea.startDate)}</span>}
                      {idea.endDate && <span>Fim: {formatDate(idea.endDate)}</span>}
                    </div>
                  )}
                  <div className="idea-footer">
                    <small>Criado em: {formatDate(idea.createdAt)}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DownloadMind;

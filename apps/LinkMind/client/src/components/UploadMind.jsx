import React, { useState, useEffect, useRef } from 'react';
import './UploadMind.css'; // Crie este arquivo para os estilos ou importe o CSS global

const UploadMind = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const suggestionsRef = useRef();

  useEffect(() => {
    loadSuggestions();
    // Ocultar sugestões ao clicar fora
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSuggestions = async () => {
    try {
      const res = await fetch('/api/suggestions');
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions);
      }
    } catch {}
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    if (value.length >= 2) {
      setFilteredSuggestions(
        suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 5)
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (s) => {
    setTitle(s);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, startDate: startDate || null, endDate: endDate || null })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Ideia salva com sucesso!');
        setMessageType('success');
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        loadSuggestions();
      } else {
        setMessage(data.error);
        setMessageType('error');
      }
    } catch {
      setMessage('Erro ao salvar ideia. Tente novamente.');
      setMessageType('error');
    }
  };

  const handleNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        createNotification();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') createNotification();
        });
      } else {
        setMessage('Notificações foram negadas. Habilite nas configurações do navegador.');
        setMessageType('error');
      }
    } else {
      setMessage('Notificações não são suportadas neste navegador.');
      setMessageType('error');
    }
  };

  const createNotification = () => {
    new window.Notification(`LinkMind: ${title || 'Nova Ideia'}`, {
      body: (description || 'Sem descrição').substring(0, 100) + ((description || '').length > 100 ? '...' : ''),
      icon: '/images/icon-192.png',
      tag: 'linkmind-idea'
    });
    setMessage('Notificação criada!');
    setMessageType('success');
  };

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
      <main className="upload-mind">
        <div className="form-container">
          <h2>📝 Nova Ideia</h2>
          <p>Capture sua inspiração e organize seus pensamentos</p>
          <form className="idea-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label htmlFor="title">Quem/O quê</label>
              <div className="autocomplete-container" ref={suggestionsRef}>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Digite o título da sua ideia..."
                  value={title}
                  onChange={handleTitleChange}
                  required
                  autoComplete="off"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="suggestions-list">
                    {filteredSuggestions.map((s, i) => (
                      <div key={i} className="suggestion-item" onClick={() => handleSuggestionClick(s)}>{s}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Data de Início (opcional)</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">Data de Fim (opcional)</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                placeholder="Descreva sua ideia em detalhes..."
                rows={6}
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">📝 Salvar Ideia</button>
              <button type="button" className="btn btn-outline" onClick={handleNotification}>🔔 Criar Notificação</button>
            </div>
          </form>
          {message && <div className={`message ${messageType}`}>{message}</div>}
        </div>
      </main>
    </div>
  );
};

export default UploadMind;

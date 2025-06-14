import React, { useEffect, useState } from 'react';
import './Settings.css'; // Crie este arquivo para os estilos ou importe o CSS global

const Settings = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [stats, setStats] = useState({ totalIdeas: '-', accountAge: '-', lastLogin: '-' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileMsgType, setProfileMsgType] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordMsgType, setPasswordMsgType] = useState('');

  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (res.ok) setProfile({ name: data.name || '', email: data.email || '' });
    } catch {}
  };

  const loadUserStats = async () => {
    try {
      const res = await fetch('/api/user/stats');
      const data = await res.json();
      if (res.ok) setStats({
        totalIdeas: data.totalIdeas || 0,
        accountAge: data.accountAge || '-',
        lastLogin: data.lastLogin || '-'
      });
    } catch {}
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileMsgType('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name })
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg(data.message);
        setProfileMsgType('success');
      } else {
        setProfileMsg(data.error);
        setProfileMsgType('error');
      }
    } catch {
      setProfileMsg('Erro de conexão. Tente novamente.');
      setProfileMsgType('error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordMsgType('');
    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;
    if (newPassword !== confirmPassword) {
      setPasswordMsg('As senhas não coincidem.');
      setPasswordMsgType('error');
      return;
    }
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg(data.message);
        setPasswordMsgType('success');
        e.target.reset();
      } else {
        setPasswordMsg(data.error);
        setPasswordMsgType('error');
      }
    } catch {
      setPasswordMsg('Erro de conexão. Tente novamente.');
      setPasswordMsgType('error');
    }
  };

  const handleDeleteAllIdeas = async () => {
    if (!window.confirm('⚠️ Tem certeza que deseja excluir TODAS as suas ideias? Esta ação não pode ser desfeita!')) return;
    try {
      const res = await fetch('/api/user/delete-all-ideas', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg(data.message);
        setProfileMsgType('success');
        loadUserStats();
      } else {
        setProfileMsg(data.error);
        setProfileMsgType('error');
      }
    } catch {
      setProfileMsg('Erro de conexão. Tente novamente.');
      setProfileMsgType('error');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt('⚠️ ATENÇÃO: Esta ação excluirá permanentemente sua conta e todos os dados.\n\nDigite "EXCLUIR CONTA" para confirmar:');
    if (confirmation !== 'EXCLUIR CONTA') {
      setProfileMsg('Operação cancelada.');
      setProfileMsgType('info');
      return;
    }
    try {
      const res = await fetch('/api/user/delete-account', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg('Conta excluída com sucesso. Redirecionando...');
        setProfileMsgType('success');
        setTimeout(() => { window.location.href = '/'; }, 2000);
      } else {
        setProfileMsg(data.error);
        setProfileMsgType('error');
      }
    } catch {
      setProfileMsg('Erro de conexão. Tente novamente.');
      setProfileMsgType('error');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div className="header-nav">
            <a href="/dashboard" className="back-btn">← Voltar</a>
            <h1>⚙️ Configurações</h1>
          </div>
        </div>
      </header>
      <main className="settings">
        <div className="settings-section">
          <h2>Perfil do Usuário</h2>
          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="displayName">Nome de Exibição</label>
              <input
                type="text"
                id="displayName"
                placeholder="Seu nome"
                required
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="currentEmail">Email</label>
              <input
                type="email"
                id="currentEmail"
                value={profile.email}
                readOnly
              />
              <small>Para alterar o email, entre em contato com o suporte</small>
            </div>
            <button type="submit" className="btn btn-primary">Salvar Alterações</button>
            {profileMsg && <div className={`message ${profileMsgType}`}>{profileMsg}</div>}
          </form>
        </div>
        <div className="settings-section">
          <h2>Alterar Senha</h2>
          <form className="password-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Senha Atual</label>
              <input type="password" id="currentPassword" name="currentPassword" placeholder="Digite sua senha atual" required />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Nova Senha</label>
              <input type="password" id="newPassword" name="newPassword" placeholder="Digite a nova senha" required minLength={6} />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirme a nova senha" required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary">Alterar Senha</button>
            {passwordMsg && <div className={`message ${passwordMsgType}`}>{passwordMsg}</div>}
          </form>
        </div>
        <div className="settings-section">
          <h2>Estatísticas</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalIdeas}</div>
              <div className="stat-label">Total de Ideias</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.accountAge}</div>
              <div className="stat-label">Conta criada há</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.lastLogin}</div>
              <div className="stat-label">Último acesso</div>
            </div>
          </div>
        </div>
        <div className="settings-section danger-zone">
          <h2>⚠️ Zona Perigosa</h2>
          <p className="danger-text">As ações abaixo são irreversíveis. Proceda com cuidado.</p>
          <div className="danger-actions">
            <button type="button" className="btn btn-danger" onClick={handleDeleteAllIdeas}>🗑️ Excluir Todas as Ideias</button>
            <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>❌ Excluir Conta Permanentemente</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

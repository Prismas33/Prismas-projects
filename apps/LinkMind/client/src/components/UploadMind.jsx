import React, { useState, useEffect } from 'react';

const UploadMind = () => {
  const [quem, setQuem] = useState('');
  const [quemSugestoes, setQuemSugestoes] = useState([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [descricao, setDescricao] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (quem.length > 1) {
      fetch(`http://localhost:3001/api/autocomplete?query=${quem}`)
        .then(res => res.json())
        .then(data => setQuemSugestoes(data.sugestoes || []));
    } else {
      setQuemSugestoes([]);
    }
  }, [quem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    const uid = localStorage.getItem('uid');
    const res = await fetch('http://localhost:3001/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quem, dataInicio, dataFim, descricao, uid })
    });
    if (res.ok) setMsg('Ideia adicionada!');
    else setMsg('Erro ao adicionar ideia.');
  };

  return (
    <div className="uploadmind-container">
      <h2>Adicionar Ideia</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Quem/O quê" value={quem} onChange={e => setQuem(e.target.value)} list="quem-list" required />
        <datalist id="quem-list">
          {quemSugestoes.map((s, i) => <option key={i} value={s} />)}
        </datalist>
        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} placeholder="Data início" />
        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} placeholder="Data fim" />
        <textarea placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} required />
        <button className="btn-primary" type="submit">Salvar</button>
      </form>
      {msg && <div className="notification">{msg}</div>}
    </div>
  );
};

export default UploadMind;

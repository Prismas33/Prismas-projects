import React, { useState, useEffect } from 'react';

const DownloadMind = () => {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:3001/api/ideas?busca=${busca}&filtro=${filtro}`);
      const data = await res.json();
      setResultados(data.ideas || []);
    };
    fetchData();
  }, [busca, filtro]);

  return (
    <div className="downloadmind-container">
      <h2>Buscar Ideia</h2>
      <input type="text" placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} />
      <select value={filtro} onChange={e => setFiltro(e.target.value)}>
        <option value="">Todos</option>
        <option value="quem">Quem/O quê</option>
        <option value="descricao">Descrição</option>
      </select>
      <ul>
        {resultados.map((idea, i) => (
          <li key={i}>
            <strong>{idea.quem}</strong> ({idea.dataInicio} - {idea.dataFim})<br />
            {idea.descricao}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DownloadMind;

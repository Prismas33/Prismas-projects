export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <h1 style={{ fontSize: '3rem', color: '#7B4BFF', marginBottom: '1rem' }}>404 - Página não encontrada</h1>
      <p style={{ color: '#333', marginBottom: '2rem' }}>
        A página que você procura não existe ou foi movida.
      </p>
      <a href="/" style={{ color: '#fff', background: '#7B4BFF', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}>
        Voltar para o início
      </a>
    </div>
  );
}

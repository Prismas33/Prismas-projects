export default function CardIdeia({ ideia }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-[var(--roxo-eletrico)]">
      <h3 className="font-bold text-[var(--azul-profundo)]">{ideia.titulo}</h3>
      <p className="text-sm text-gray-600">{ideia.descricao}</p>
      <div className="text-xs text-gray-400 mt-2">{ideia.data}</div>
    </div>
  );
}

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-[var(--azul-profundo)] text-white">
      <Link href="/dashboard" className="font-bold text-lg">LinkMind</Link>
      <div className="flex gap-4">
        <Link href="/adicionar-ideia">Adicionar Ideia</Link>
        <Link href="/buscar-ideia">Buscar Ideia</Link>
      </div>
    </nav>
  );
}

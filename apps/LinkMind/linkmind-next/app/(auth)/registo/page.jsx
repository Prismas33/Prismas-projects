import { useState } from "react";
import { registarUtilizador } from "../../../lib/firebase/auth";
import { useRouter } from "next/navigation";

export default function RegistoPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await registarUtilizador(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Erro ao registar: " + err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
      <h2 className="text-xl font-bold">Registo</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="p-2 rounded border" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="p-2 rounded border" />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button type="submit" className="bg-[var(--azul-profundo)] text-white p-2 rounded">Registar</button>
    </form>
  );
}

// Centraliza utilitários Firebase
export function nomeParaIdFirestore(nome) {
  return nome.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

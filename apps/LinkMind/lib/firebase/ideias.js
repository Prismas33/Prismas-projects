import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from "firebase/firestore";
import { db } from "./config";
import { nomeParaIdFirestore } from "./utils";

export async function adicionarIdeia(userNomeId, ideia) {
  try {
    const userRef = doc(db, "users", userNomeId);
    await updateDoc(userRef, {
      ideias: arrayUnion({
        ...ideia,
        criadaEm: new Date(),
        ativa: true
      })
    });
    return true;
  } catch (error) {
    throw new Error("Erro ao adicionar ideia: " + error.message);
  }
}

export async function buscarIdeias(userNome, termoBusca = "") {
  try {
    const userNomeId = nomeParaIdFirestore(userNome);
    const userRef = doc(db, "users", userNomeId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return [];
    let ideias = userSnap.data().ideias || [];
    if (termoBusca) {
      ideias = ideias.filter(
        (ideia) =>
          ideia.quem?.toLowerCase().includes(termoBusca.toLowerCase()) ||
          ideia.oque?.toLowerCase().includes(termoBusca.toLowerCase()) ||
          ideia.categoria?.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }
    // Ordena por criadaEm desc
    ideias.sort((a, b) => (b.criadaEm?.toDate?.() || new Date(b.criadaEm)) - (a.criadaEm?.toDate?.() || new Date(a.criadaEm)));
    return ideias;
  } catch (error) {
    throw new Error("Erro ao buscar ideias: " + error.message);
  }
}

export async function obterSugestoes(termoBusca) {
  try {
    const q = query(
      collection(db, "ideias"),
      where("ativa", "==", true),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const sugestoes = new Set();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.titulo?.toLowerCase().includes(termoBusca.toLowerCase())) {
        sugestoes.add(data.titulo);
      }
      if (data.categoria?.toLowerCase().includes(termoBusca.toLowerCase())) {
        sugestoes.add(data.categoria);
      }
    });
    
    return Array.from(sugestoes).slice(0, 5);
  } catch (error) {
    console.error("Erro ao obter sugestões:", error);
    return [];
  }
}

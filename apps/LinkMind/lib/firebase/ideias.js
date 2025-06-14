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
  arrayUnion
} from "firebase/firestore";
import { db } from "./config";

export async function adicionarIdeia(userId, ideia) {
  try {
    // Adicionar ideia na coleção "ideias"
    const docRef = await addDoc(collection(db, "ideias"), {
      ...ideia,
      userId: userId,
      criadaEm: new Date(),
      ativa: true
    });
    
    // Adicionar referência da ideia ao utilizador
    const userRef = doc(db, "utilizadores", userId);
    await updateDoc(userRef, {
      ideias: arrayUnion(docRef.id)
    });
    
    return docRef.id;
  } catch (error) {
    throw new Error("Erro ao adicionar ideia: " + error.message);
  }
}

export async function buscarIdeias(userId, termoBusca = "") {
  try {
    let q;
    
    if (termoBusca) {
      // Buscar por termo específico
      q = query(
        collection(db, "ideias"),
        where("userId", "==", userId),
        where("ativa", "==", true),
        orderBy("criadaEm", "desc")
      );
    } else {
      // Buscar todas as ideias do usuário
      q = query(
        collection(db, "ideias"),
        where("userId", "==", userId),
        where("ativa", "==", true),
        orderBy("criadaEm", "desc")
      );
    }
    
    const querySnapshot = await getDocs(q);
    const ideias = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Filtrar por termo se fornecido
      if (!termoBusca || 
          data.titulo?.toLowerCase().includes(termoBusca.toLowerCase()) ||
          data.descricao?.toLowerCase().includes(termoBusca.toLowerCase()) ||
          data.categoria?.toLowerCase().includes(termoBusca.toLowerCase())) {
        ideias.push({
          id: doc.id,
          ...data
        });
      }
    });
    
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

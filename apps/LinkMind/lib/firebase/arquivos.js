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

export async function uploadArquivo(userNomeId, arquivo) {
  try {
    const userRef = doc(db, "users", userNomeId);
    await updateDoc(userRef, {
      arquivos: arrayUnion({
        ...arquivo,
        criadoEm: new Date(),
        ativo: true
      })
    });
    return true;
  } catch (error) {
    throw new Error("Erro ao fazer upload do arquivo: " + error.message);
  }
}

export async function downloadArquivos(userNome, termoBusca = "") {
  try {
    const userNomeId = nomeParaIdFirestore(userNome);
    const userRef = doc(db, "users", userNomeId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return [];
      // Compatibilidade: procurar tanto 'arquivos' quanto 'ideias' (dados antigos)
    let arquivos = userSnap.data().arquivos || userSnap.data().ideias || [];
    
    // Adicionar índice original a cada arquivo (antes de qualquer filtragem/ordenação)
    arquivos = arquivos.map((arquivo, index) => ({
      ...arquivo,
      originalIndex: index
    }));
    
    if (termoBusca) {
      arquivos = arquivos.filter(
        (arquivo) =>
          arquivo.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
          arquivo.subNome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
          arquivo.conteudo?.toLowerCase().includes(termoBusca.toLowerCase()) ||
          arquivo.categoria?.toLowerCase().includes(termoBusca.toLowerCase()) ||
          // Compatibilidade com estrutura antiga
          arquivo.quem?.toLowerCase().includes(termoBusca.toLowerCase()) ||
          arquivo.oque?.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }    // Ordena por criadoEm ou criadaEm (compatibilidade) desc
    arquivos.sort((a, b) => {
      const dataA = a.criadoEm || a.criadaEm;
      const dataB = b.criadoEm || b.criadaEm;
      return (dataB?.toDate?.() || new Date(dataB)) - (dataA?.toDate?.() || new Date(dataA));
    });
    return arquivos;
  } catch (error) {
    throw new Error("Erro ao fazer download dos arquivos: " + error.message);
  }
}

export async function obterSugestoesNomes(userNome, termoBusca) {
  try {
    const userNomeId = nomeParaIdFirestore(userNome);
    const userRef = doc(db, "users", userNomeId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return [];
    
    const arquivos = userSnap.data().arquivos || [];
    const sugestoes = new Set();
    
    arquivos.forEach((arquivo) => {
      if (arquivo.nome && arquivo.nome.toLowerCase().includes(termoBusca.toLowerCase())) {
        sugestoes.add(arquivo.nome);
      }
    });
    
    return Array.from(sugestoes).slice(0, 5);
  } catch (error) {
    console.error("Erro ao obter sugestões de nomes:", error);
    return [];
  }
}

export async function obterHistoricoArquivo(userNome, nomeArquivo) {
  try {
    const userNomeId = nomeParaIdFirestore(userNome);
    const userRef = doc(db, "users", userNomeId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return [];
    
    const arquivos = userSnap.data().arquivos || [];
    return arquivos.filter(arquivo => 
      arquivo.nome && arquivo.nome.toLowerCase() === nomeArquivo.toLowerCase()
    ).sort((a, b) => (b.criadoEm?.toDate?.() || new Date(b.criadoEm)) - (a.criadoEm?.toDate?.() || new Date(a.criadoEm)));
  } catch (error) {
    console.error("Erro ao obter histórico do arquivo:", error);
    return [];
  }
}

export async function obterSugestoes(termoBusca) {
  try {
    const q = query(
      collection(db, "arquivos"),
      where("ativo", "==", true),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const sugestoes = new Set();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.nome?.toLowerCase().includes(termoBusca.toLowerCase())) {
        sugestoes.add(data.nome);
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

export async function removerArquivo(userNome, arquivoIndex) {
  try {
    const userNomeId = nomeParaIdFirestore(userNome);
    const userRef = doc(db, "users", userNomeId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) throw new Error("Usuário não encontrado");
    
    let arquivos = userSnap.data().arquivos || userSnap.data().ideias || [];
    
    // Remove o arquivo pelo índice
    arquivos.splice(arquivoIndex, 1);
    
    await updateDoc(userRef, {
      arquivos: arquivos
    });
    
    return true;
  } catch (error) {
    throw new Error("Erro ao remover arquivo: " + error.message);
  }
}

export async function editarArquivo(userNome, arquivoIndex, arquivoAtualizado) {
  try {
    const userNomeId = nomeParaIdFirestore(userNome);
    const userRef = doc(db, "users", userNomeId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) throw new Error("Usuário não encontrado");
    
    let arquivos = userSnap.data().arquivos || userSnap.data().ideias || [];
    
    // Atualiza o arquivo pelo índice
    if (arquivos[arquivoIndex]) {
      arquivos[arquivoIndex] = {
        ...arquivos[arquivoIndex],
        ...arquivoAtualizado,
        atualizadoEm: new Date()
      };
    }
    
    await updateDoc(userRef, {
      arquivos: arquivos
    });
    
    return true;
  } catch (error) {
    throw new Error("Erro ao editar arquivo: " + error.message);
  }
}

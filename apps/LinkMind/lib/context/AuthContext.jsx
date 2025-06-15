"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    
    console.log('AuthProvider - Iniciando listener de autenticação');
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('AuthProvider - Estado de auth mudou:', !!currentUser, currentUser?.uid);
      
      // Só atualiza o estado se realmente mudou
      setUser(prevUser => {
        if (prevUser?.uid !== currentUser?.uid) {
          console.log('AuthProvider - Usuário realmente mudou de', prevUser?.uid, 'para', currentUser?.uid);
          return currentUser;
        }
        return prevUser;
      });
      
      if (!authResolved) {
        setAuthResolved(true);
        console.log('AuthProvider - Estado de autenticação resolvido');
      }
      
      setLoading(false);
    });
    
    return () => {
      console.log('AuthProvider - Removendo listener de autenticação');
      unsubscribe();
    };
  }, [mounted]); // Removido authResolved das dependências para evitar loops
  // Sempre renderizar o provider para evitar hydration mismatch
  return (
    <AuthContext.Provider value={{ 
      user: mounted && authResolved ? user : null, 
      loading: !mounted || !authResolved 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// AuthContext.jsx — Estado global de autenticação
// Context API do React permite compartilhar dados (usuário logado, token)
// entre todos os componentes sem precisar passar props manualmente.

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  // Ao carregar o app, verifica se já havia um usuário logado
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('usuario');
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    }
  }, []);

  const login = (dadosUsuario, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto facilmente em qualquer componente
export function useAuth() {
  return useContext(AuthContext);
}

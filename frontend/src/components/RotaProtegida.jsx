// RotaProtegida.jsx — Guarda rotas privadas
// Se o usuário não estiver logado, redireciona para /login.
// Se estiver logado mas não tiver o nível certo, redireciona para /acesso-negado.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RotaProtegida({ children, nivelRequerido }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (nivelRequerido && usuario.nivel !== nivelRequerido) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return children;
}

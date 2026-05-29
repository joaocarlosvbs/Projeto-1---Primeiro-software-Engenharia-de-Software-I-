// Toast.jsx — Notificação flutuante reutilizável
import { useEffect } from 'react';

export default function Toast({ mensagem, tipo = 'sucesso', onFechar }) {
  useEffect(() => {
    const t = setTimeout(onFechar, 3500);
    return () => clearTimeout(t);
  }, [onFechar]);

  const icones = { sucesso: '✅', erro: '❌', info: 'ℹ️' };

  return (
    <div className={`toast toast-${tipo}`}>
      {icones[tipo]} {mensagem}
    </div>
  );
}

// Hook para usar o Toast facilmente
import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);

  const mostrar = useCallback((mensagem, tipo = 'sucesso') => {
    setToast({ mensagem, tipo });
  }, []);

  const ToastContainer = toast
    ? <Toast mensagem={toast.mensagem} tipo={toast.tipo} onFechar={() => setToast(null)} />
    : null;

  return { mostrar, ToastContainer };
}

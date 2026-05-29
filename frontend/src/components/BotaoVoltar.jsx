// BotaoVoltar.jsx — Botão de voltar reutilizável
import { useNavigate } from 'react-router-dom';

export default function BotaoVoltar({ para, label = '← Voltar' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => para ? navigate(para) : navigate(-1)}
      style={styles.btn}
    >
      {label}
    </button>
  );
}

const styles = {
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    backgroundColor: 'transparent', color: '#1e3a8a',
    border: '1.5px solid #bfdbfe', borderRadius: '8px',
    padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: '600',
    fontSize: '0.9rem', marginBottom: '1.5rem',
    transition: 'all 0.15s',
  },
};

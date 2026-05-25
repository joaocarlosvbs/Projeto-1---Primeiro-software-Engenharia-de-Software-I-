// App.jsx — Roteamento central da aplicação
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Portfolio from './pages/Portfolio';
import Contato from './pages/Contato';
import AreaCliente from './pages/AreaCliente';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/cliente" element={
            <RotaProtegida><AreaCliente /></RotaProtegida>
          } />
          <Route path="/admin" element={
            <RotaProtegida nivelRequerido="Administrador"><AdminDashboard /></RotaProtegida>
          } />
          <Route path="/acesso-negado" element={
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <h1>🚫 Acesso Negado</h1>
              <p>Você não tem permissão para acessar esta página.</p>
            </div>
          } />
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <h1>404 — Página não encontrada</h1>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

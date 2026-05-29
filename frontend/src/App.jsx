// App.jsx — Roteamento completo e final
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import Navbar from './components/Navbar';

import Home           from './pages/Home';
import Login          from './pages/Login';
import EsqueciSenha   from './pages/EsqueciSenha';
import Cadastro       from './pages/Cadastro';
import Portfolio      from './pages/Portfolio';
import Contato        from './pages/Contato';
import AreaCliente    from './pages/AreaCliente';
import Encomendar     from './pages/Encomendar';
import AdminDashboard from './pages/AdminDashboard';
import AdminProdutos  from './pages/AdminProdutos';
import AdminFornecedores from './pages/AdminFornecedores';
import AdminMateriaPrima from './pages/AdminMateriaPrima';
import AdminCompras   from './pages/AdminCompras';
import AdminClientes  from './pages/AdminClientes';
import AdminUsuarios  from './pages/AdminUsuarios';
import AdminFluxoCaixa from './pages/AdminFluxoCaixa';
import AdminRelatorios from './pages/AdminRelatorios';
import AdminLogs      from './pages/AdminLogs';

const Admin = ({ children }) => (
  <RotaProtegida nivelRequerido="Administrador">{children}</RotaProtegida>
);

const paginaNaoEncontrada = (titulo, msg) => (
  <div style={{ textAlign:'center', padding:'5rem 2rem' }}>
    <p style={{ fontSize:'4rem', marginBottom:'1rem' }}>🚫</p>
    <h1 style={{ color:'#1e3a8a' }}>{titulo}</h1>
    <p style={{ color:'#64748b', marginTop:'0.5rem' }}>{msg}</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Públicas */}
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/cadastro"      element={<Cadastro />} />
          <Route path="/portfolio"     element={<Portfolio />} />
          <Route path="/contato"       element={<Contato />} />

          {/* Cliente (logado) */}
          <Route path="/cliente"    element={<RotaProtegida><AreaCliente /></RotaProtegida>} />
          <Route path="/encomendar" element={<RotaProtegida><Encomendar /></RotaProtegida>} />

          {/* Admin */}
          <Route path="/admin"                  element={<Admin><AdminDashboard /></Admin>} />
          <Route path="/admin/produtos"         element={<Admin><AdminProdutos /></Admin>} />
          <Route path="/admin/fornecedores"     element={<Admin><AdminFornecedores /></Admin>} />
          <Route path="/admin/materiaprima"     element={<Admin><AdminMateriaPrima /></Admin>} />
          <Route path="/admin/compras"          element={<Admin><AdminCompras /></Admin>} />
          <Route path="/admin/clientes"         element={<Admin><AdminClientes /></Admin>} />
          <Route path="/admin/usuarios"         element={<Admin><AdminUsuarios /></Admin>} />
          <Route path="/admin/financeiro"       element={<Admin><AdminFluxoCaixa /></Admin>} />
          <Route path="/admin/relatorios"       element={<Admin><AdminRelatorios /></Admin>} />
          <Route path="/admin/logs"             element={<Admin><AdminLogs /></Admin>} />

          <Route path="/acesso-negado" element={paginaNaoEncontrada('Acesso Negado', 'Você não tem permissão para acessar esta página.')} />
          <Route path="*"              element={paginaNaoEncontrada('404 — Não encontrado', 'A página que você procura não existe.')} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

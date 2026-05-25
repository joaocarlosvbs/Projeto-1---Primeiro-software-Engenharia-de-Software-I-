// App.jsx — Roteamento completo com todos os UCs
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import Navbar from './components/Navbar';

// Páginas públicas
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Portfolio from './pages/Portfolio';
import Contato from './pages/Contato';

// Área do cliente
import AreaCliente from './pages/AreaCliente';
import Encomendar from './pages/Encomendar';

// Área do admin
import AdminDashboard from './pages/AdminDashboard';
import AdminProdutos from './pages/AdminProdutos';
import AdminFornecedores from './pages/AdminFornecedores';
import AdminMateriaPrima from './pages/AdminMateriaPrima';
import AdminCompras from './pages/AdminCompras';
import AdminClientes from './pages/AdminClientes';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminFluxoCaixa from './pages/AdminFluxoCaixa';
import AdminRelatorios from './pages/AdminRelatorios';

const Admin = ({ children }) => (
  <RotaProtegida nivelRequerido="Administrador">{children}</RotaProtegida>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Públicas */}
          <Route path="/"          element={<Home />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/cadastro"  element={<Cadastro />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contato"   element={<Contato />} />

          {/* Cliente */}
          <Route path="/cliente"    element={<RotaProtegida><AreaCliente /></RotaProtegida>} />
          <Route path="/encomendar" element={<RotaProtegida><Encomendar /></RotaProtegida>} />

          {/* Admin */}
          <Route path="/admin"                element={<Admin><AdminDashboard /></Admin>} />
          <Route path="/admin/produtos"       element={<Admin><AdminProdutos /></Admin>} />
          <Route path="/admin/fornecedores"   element={<Admin><AdminFornecedores /></Admin>} />
          <Route path="/admin/materiaprima"   element={<Admin><AdminMateriaPrima /></Admin>} />
          <Route path="/admin/compras"        element={<Admin><AdminCompras /></Admin>} />
          <Route path="/admin/clientes"       element={<Admin><AdminClientes /></Admin>} />
          <Route path="/admin/usuarios"       element={<Admin><AdminUsuarios /></Admin>} />
          <Route path="/admin/financeiro"     element={<Admin><AdminFluxoCaixa /></Admin>} />
          <Route path="/admin/relatorios"     element={<Admin><AdminRelatorios /></Admin>} />

          <Route path="/acesso-negado" element={
            <div style={{textAlign:'center', padding:'4rem'}}>
              <h1>🚫 Acesso Negado</h1>
              <p>Você não tem permissão para acessar esta página.</p>
            </div>
          } />
          <Route path="*" element={
            <div style={{textAlign:'center', padding:'4rem'}}>
              <h1>404 — Página não encontrada</h1>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

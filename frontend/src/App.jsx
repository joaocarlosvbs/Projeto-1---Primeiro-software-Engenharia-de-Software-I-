// frontend/src/App.jsx — completo com todas as rotas
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import Navbar from './components/Navbar';
import AdminLayout from './pages/AdminLayout';

// Públicas
import Home         from './pages/Home';
import Login        from './pages/Login';
import Cadastro     from './pages/Cadastro';
import Portfolio    from './pages/Portfolio';
import Contato      from './pages/Contato';
import AcessoNegado from './pages/AcessoNegado';
import EsqueciSenha from './pages/EsqueciSenha';

// Cliente
import AreaCliente from './pages/AreaCliente';
import Encomendar  from './pages/Encomendar';

// Admin
import AdminDashboard        from './pages/AdminDashboard';
import AdminProdutos         from './pages/AdminProdutos';
import AdminClientes         from './pages/AdminClientes';
import AdminFornecedores     from './pages/AdminFornecedores';
import AdminMateriaPrima     from './pages/AdminMateriaPrima';
import AdminCompras          from './pages/AdminCompras';
import AdminFluxoCaixa       from './pages/AdminFluxoCaixa';
import AdminRelatorios       from './pages/AdminRelatorios';
import AdminUsuarios         from './pages/AdminUsuarios';
import AdminLogs             from './pages/AdminLogs';
import AdminEstoque          from './pages/AdminEstoque';
import AdminPedidosHistorico from './pages/AdminPedidosHistorico';

function LayoutPublico({ children }) {
  return <><Navbar />{children}</>;
}

function LayoutAdmin({ children }) {
  return (
    <RotaProtegida nivelRequerido="Administrador">
      <AdminLayout>{children}</AdminLayout>
    </RotaProtegida>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/"              element={<LayoutPublico><Home/></LayoutPublico>} />
          <Route path="/portfolio"     element={<LayoutPublico><Portfolio/></LayoutPublico>} />
          <Route path="/contato"       element={<LayoutPublico><Contato/></LayoutPublico>} />
          <Route path="/login"         element={<LayoutPublico><Login/></LayoutPublico>} />
          <Route path="/cadastro"      element={<LayoutPublico><Cadastro/></LayoutPublico>} />
          <Route path="/acesso-negado" element={<LayoutPublico><AcessoNegado/></LayoutPublico>} />
          <Route path="/esqueci-senha" element={<LayoutPublico><EsqueciSenha/></LayoutPublico>} />

          {/* Cliente */}
          <Route path="/area-cliente" element={
            <RotaProtegida nivelRequerido="Cliente">
              <LayoutPublico><AreaCliente/></LayoutPublico>
            </RotaProtegida>
          }/>
          <Route path="/encomendar" element={
            <RotaProtegida nivelRequerido="Cliente">
              <LayoutPublico><Encomendar/></LayoutPublico>
            </RotaProtegida>
          }/>

          {/* Admin */}
          <Route path="/admin"               element={<LayoutAdmin><AdminDashboard/></LayoutAdmin>}/>
          <Route path="/admin/produtos"      element={<LayoutAdmin><AdminProdutos/></LayoutAdmin>}/>
          <Route path="/admin/clientes"      element={<LayoutAdmin><AdminClientes/></LayoutAdmin>}/>
          <Route path="/admin/fornecedores"  element={<LayoutAdmin><AdminFornecedores/></LayoutAdmin>}/>
          <Route path="/admin/materiaprima"  element={<LayoutAdmin><AdminMateriaPrima/></LayoutAdmin>}/>
          <Route path="/admin/compras"       element={<LayoutAdmin><AdminCompras/></LayoutAdmin>}/>
          <Route path="/admin/financeiro"    element={<LayoutAdmin><AdminFluxoCaixa/></LayoutAdmin>}/>
          <Route path="/admin/relatorios"    element={<LayoutAdmin><AdminRelatorios/></LayoutAdmin>}/>
          <Route path="/admin/usuarios"      element={<LayoutAdmin><AdminUsuarios/></LayoutAdmin>}/>
          <Route path="/admin/logs"          element={<LayoutAdmin><AdminLogs/></LayoutAdmin>}/>
          {/* Novas páginas do changes6 */}
          <Route path="/admin/estoque"       element={<LayoutAdmin><AdminEstoque/></LayoutAdmin>}/>
          <Route path="/admin/pedidos"       element={<LayoutAdmin><AdminPedidosHistorico/></LayoutAdmin>}/>
          <Route path="/admin/historico"     element={<LayoutAdmin><AdminPedidosHistorico/></LayoutAdmin>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

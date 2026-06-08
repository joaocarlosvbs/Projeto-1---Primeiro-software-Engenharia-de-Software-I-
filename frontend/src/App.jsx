// App.jsx — Rotas atualizadas com AdminLayout e novas páginas
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import AdminLayout from './pages/AdminLayout';

// Páginas públicas
import Home        from './pages/Home';
import Login       from './pages/Login';
import Cadastro    from './pages/Cadastro';
import Portfolio   from './pages/Portfolio';
import Contato     from './pages/Contato';
import AcessoNegado from './pages/AcessoNegado';

// Área do cliente
import AreaCliente from './pages/AreaCliente';
import Encomendar  from './pages/Encomendar';

// Área admin — todas recebem o AdminLayout automaticamente via rota pai
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

// Wrapper que aplica layout + proteção a todas as rotas admin
function AdminPage({ children }) {
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
          <Route path="/"          element={<Home/>} />
          <Route path="/login"     element={<Login/>} />
          <Route path="/cadastro"  element={<Cadastro/>} />
          <Route path="/portfolio" element={<Portfolio/>} />
          <Route path="/contato"   element={<Contato/>} />
          <Route path="/acesso-negado" element={<AcessoNegado/>} />

          {/* Área do cliente */}
          <Route path="/area-cliente" element={
            <RotaProtegida nivelRequerido="Cliente"><AreaCliente/></RotaProtegida>
          }/>
          <Route path="/encomendar" element={
            <RotaProtegida nivelRequerido="Cliente"><Encomendar/></RotaProtegida>
          }/>

          {/* Admin — todas com sidebar */}
          <Route path="/admin"                element={<AdminPage><AdminDashboard/></AdminPage>}/>
          <Route path="/admin/produtos"       element={<AdminPage><AdminProdutos/></AdminPage>}/>
          <Route path="/admin/clientes"       element={<AdminPage><AdminClientes/></AdminPage>}/>
          <Route path="/admin/fornecedores"   element={<AdminPage><AdminFornecedores/></AdminPage>}/>
          <Route path="/admin/materiaprima"   element={<AdminPage><AdminMateriaPrima/></AdminPage>}/>
          <Route path="/admin/compras"        element={<AdminPage><AdminCompras/></AdminPage>}/>
          <Route path="/admin/financeiro"     element={<AdminPage><AdminFluxoCaixa/></AdminPage>}/>
          <Route path="/admin/relatorios"     element={<AdminPage><AdminRelatorios/></AdminPage>}/>
          <Route path="/admin/usuarios"       element={<AdminPage><AdminUsuarios/></AdminPage>}/>
          <Route path="/admin/logs"           element={<AdminPage><AdminLogs/></AdminPage>}/>
          <Route path="/admin/estoque"        element={<AdminPage><AdminEstoque/></AdminPage>}/>
          <Route path="/admin/historico"      element={<AdminPage><AdminPedidosHistorico/></AdminPage>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

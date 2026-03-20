import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';
import Admin from './pages/Admin';
import Productor from './pages/Productor';
import MisPedidos from './pages/MisPedidos';
import Perfil from './pages/Perfil';
import NotFound from './pages/NotFound';
import DetalleProducto from './pages/DetalleProducto';
import PedidosProductor from './pages/PedidosProductor';
import CambiarPassword from './pages/CambiarPassword';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/catalogo" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:id" element={<DetalleProducto />} />
          <Route path="/carrito" element={<PrivateRoute rol="COMPRADOR"><Carrito /></PrivateRoute>} />
          <Route path="/mis-pedidos" element={<PrivateRoute rol="COMPRADOR"><MisPedidos /></PrivateRoute>} />
          <Route path="/productor" element={<PrivateRoute rol="PRODUCTOR"><Productor /></PrivateRoute>} />
          <Route path="/productor/pedidos" element={<PrivateRoute rol="PRODUCTOR"><PedidosProductor /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute rol="ADMIN"><Admin /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
          <Route path="/perfil/cambiar-password" element={<PrivateRoute><CambiarPassword /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

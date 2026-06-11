import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Catalogo from './pages/Catalogo';
import DetalleProducto from './pages/DetalleProducto';
import Carrito from './pages/Carrito';
import Admin from './pages/Admin';
import Productor from './pages/Productor';
import PedidosProductor from './pages/PedidosProductor';
import MisPedidos from './pages/MisPedidos';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import NotFound from './pages/NotFound';
import Conversaciones from './pages/Conversaciones';
import NotificacionesVentas from './components/NotificacionesVentas';
import CambiarPassword from './pages/CambiarPassword';
import MapaProductores from './pages/MapaProductores';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <NotificacionesVentas />
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Navigate to="/catalogo" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:id" element={<DetalleProducto />} />
          <Route path="/mapa-productores" element={<MapaProductores />} />

          {/* Solo COMPRADOR */}
          <Route path="/carrito" element={
            <PrivateRoute rol="COMPRADOR"><Carrito /></PrivateRoute>
          } />
          <Route path="/mis-pedidos" element={
            <PrivateRoute rol="COMPRADOR"><MisPedidos /></PrivateRoute>
          } />

          {/* Solo PRODUCTOR */}
          <Route path="/productor" element={
            <PrivateRoute rol="PRODUCTOR"><Productor /></PrivateRoute>
          } />
          <Route path="/productor/ventas" element={
            <PrivateRoute rol="PRODUCTOR"><PedidosProductor /></PrivateRoute>
          } />
          <Route path="/productor/pedidos" element={
            <PrivateRoute rol="PRODUCTOR"><Navigate to="/productor/ventas" replace /></PrivateRoute>
          } />

          {/* Solo ADMIN */}
          <Route path="/admin" element={
            <PrivateRoute rol="ADMIN"><Admin /></PrivateRoute>
          } />
          <Route path="/admin/dashboard" element={
            <PrivateRoute rol="ADMIN"><Dashboard /></PrivateRoute>
          } />

          {/* Cualquier usuario autenticado */}
          <Route path="/perfil" element={
            <PrivateRoute><Perfil /></PrivateRoute>
          } />
          <Route path="/perfil/cambiar-password" element={
            <PrivateRoute><CambiarPassword /></PrivateRoute>
          } />
          <Route path="/conversaciones" element={
            <PrivateRoute><Conversaciones /></PrivateRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

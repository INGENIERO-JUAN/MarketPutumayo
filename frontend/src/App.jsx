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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Navigate to="/catalogo" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/catalogo" element={<Catalogo />} />

          {/* Solo COMPRADOR */}
          <Route path="/carrito" element={
            <PrivateRoute rol="COMPRADOR">
              <Carrito />
            </PrivateRoute>
          } />
          <Route path="/mis-pedidos" element={
            <PrivateRoute rol="COMPRADOR">
              <MisPedidos />
            </PrivateRoute>
          } />

          {/* Solo PRODUCTOR */}
          <Route path="/productor" element={
            <PrivateRoute rol="PRODUCTOR">
              <Productor />
            </PrivateRoute>
          } />

          {/* Solo ADMIN */}
          <Route path="/admin" element={
            <PrivateRoute rol="ADMIN">
              <Admin />
            </PrivateRoute>
          } />

          {/* Cualquier usuario autenticado */}
          <Route path="/perfil" element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

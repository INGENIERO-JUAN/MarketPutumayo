import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';
import Admin from './pages/Admin';
import Productor from './pages/Productor';

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
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/productor" element={<Productor />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

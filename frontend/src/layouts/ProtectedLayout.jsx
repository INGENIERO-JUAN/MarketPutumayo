import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../stores/useAuthStore';
import Spinner from '../components/ui/Spinner';

/**
 * ProtectedLayout — layout para rutas que requieren autenticación.
 * Valida sesión antes de renderizar; redirige a /login si no hay sesión.
 * Usa <Outlet /> para mantener la Navbar fija en todo el área autenticada.
 *
 * @param {string} [rol] - Rol requerido (COMPRADOR, PRODUCTOR, ADMIN).
 *                         Si no se pasa, acepta cualquier usuario autenticado.
 */
const ProtectedLayout = ({ rol }) => {
  const { usuario, isAuthenticated, cargando } = useAuthStore();

  // Esperar hidratación del store (evita flicker en F5)
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--crema)] dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rol && usuario.rol !== rol) {
    return <Navigate to="/catalogo" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--crema)] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;

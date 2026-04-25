import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege rutas que requieren autenticación.
 * Si no hay usuario logueado, redirige a /login.
 * Si se especifica un rol y el usuario no lo tiene, redirige a /catalogo.
 */
const PrivateRoute = ({ children, rol }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rol && usuario.rol !== rol) {
    return <Navigate to="/catalogo" replace />;
  }

  return children;
};

export default PrivateRoute;

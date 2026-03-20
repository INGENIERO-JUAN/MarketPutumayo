import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const PrivateRoute = ({ children, rol }) => {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (rol && usuario.rol !== rol) return <Navigate to="/catalogo" replace />;
  return children;
};
export default PrivateRoute;

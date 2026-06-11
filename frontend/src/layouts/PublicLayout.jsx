import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

/**
 * PublicLayout — layout para rutas públicas
 * Muestra la Navbar y renderiza la página hija con <Outlet />
 */
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--crema)] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;

import { useAuth } from '../context/AuthContext';

const useAuthStore = () => {
  const auth = useAuth();

  return {
    ...auth,
    isAuthenticated: Boolean(auth?.usuario),
  };
};

export default useAuthStore;

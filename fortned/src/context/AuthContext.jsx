import { createContext, useState, useContext, useEffect } from 'react';
import { loginVendor } from '../services/vendorService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('vendorToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // We could validate the token here with a backend call
        // For now just assume it's valid to avoid extra API calls
        setIsAuthenticated(true);
        setUser({ token });
      } catch (err) {
        console.error('Auth validation error:', err);
        localStorage.removeItem('vendorToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setError(null);
    setLoading(true);
    try {
      const res = await loginVendor(credentials);
      const { token, vendor } = res.data;
      
      localStorage.setItem('vendorToken', token);
      setUser({ ...vendor, token });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('vendorToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      error, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

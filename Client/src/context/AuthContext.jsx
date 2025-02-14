import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Ajout de useLocation pour vérifier le chemin actuel

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Permettre l'accès à la page de register sans redirection
    const publicPaths = ['/login', '/register'];
    const isPublicPath = publicPaths.includes(location.pathname);

    // Rediriger vers login seulement si l'utilisateur n'est pas authentifié 
    // et n'est pas sur une page publique
    if (!user && !loading && !isPublicPath) {
      navigate('/login');
    }
  }, [user, loading, navigate, location]);

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser({ token });
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
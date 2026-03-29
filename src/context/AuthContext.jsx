import { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '../Keycloak';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'login-required',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        if (authenticated && keycloak.tokenParsed) {
          const parsed = keycloak.tokenParsed;
          const roles = parsed.realm_access?.roles || [];
          setUser({
            id:        parsed.sub,
            email:     parsed.email,
            firstName: parsed.given_name,
            lastName:  parsed.family_name,
            fullName:  parsed.name,
            isAdmin:   roles.includes('admin'),
          });
          setToken(keycloak.token);
        }
      })
      .finally(() => setIsLoading(false));

    const interval = setInterval(() => {
      keycloak.updateToken(30).catch(() => keycloak.logout());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin ?? false,
      isLoading,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  googleLogin: async () => {},
  signOut: async () => {},
});

const STORAGE_TOKEN_KEY = "lumenx_token";
const STORAGE_USER_KEY = "lumenx_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    api.setToken(token);
    api
      .get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        api.clearToken();
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    api.setToken(data.token);
    localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await api.post("/auth/signup", { name, email, password });
    api.setToken(data.token);
    localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(data.user);
    return data;
  };

  const googleLogin = async (credential) => {
    const data = await api.post("/auth/google", { credential });
    api.setToken(data.token);
    localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(data.user);
    return data;
  };

  const signOut = async () => {
    api.clearToken();
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleLogin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

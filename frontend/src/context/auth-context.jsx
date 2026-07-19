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
const STORAGE_PROVIDER_KEY = "lumenx_auth_provider";
const AUTH_PROVIDER_GOOGLE = "google";
const AUTH_PROVIDER_LOCAL = "local";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const provider = localStorage.getItem(STORAGE_PROVIDER_KEY);
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    if (provider === AUTH_PROVIDER_GOOGLE && storedUser) {
      setUser(JSON.parse(storedUser));
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
        localStorage.removeItem(STORAGE_PROVIDER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    api.setToken(data.token);
    localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
    localStorage.setItem(STORAGE_PROVIDER_KEY, AUTH_PROVIDER_LOCAL);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await api.post("/auth/signup", { name, email, password });
    api.setToken(data.token);
    localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
    localStorage.setItem(STORAGE_PROVIDER_KEY, AUTH_PROVIDER_LOCAL);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(data.user);
    return data;
  };

  const googleLogin = async (accessToken) => {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Google login failed");
    }

    const profile = await response.json();
    const googleUser = {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
    };

    localStorage.setItem(STORAGE_TOKEN_KEY, accessToken);
    localStorage.setItem(STORAGE_PROVIDER_KEY, AUTH_PROVIDER_GOOGLE);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(googleUser));
    setUser(googleUser);

    return googleUser;
  };

  const signOut = async () => {
    api.clearToken();
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_PROVIDER_KEY);
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

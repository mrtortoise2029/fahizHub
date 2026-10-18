import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (credentials) => {
        const { data } = await api.post("/auth/login", credentials);
        setUser(data.data);
      },
      logout: async () => {
        await api.post("/auth/logout");
        setUser(null);
      },
    }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

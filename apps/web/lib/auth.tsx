"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

interface User {
  id: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      // In a real app, you might want to verify the token with the backend
      // For now, we'll just trust the stored token
      setUser({ id: "", token });
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    Cookies.set("token", token, { expires: 1 }); // 1 day
    setUser({ id: "", token });
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 
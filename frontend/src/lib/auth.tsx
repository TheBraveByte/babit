import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, setAuthToken, getAuthToken, errText } from "@/api/client";

export interface User {
  id?: string;
  email?: string;
  account_type?: "ACCOUNT_TYPE_UNSPECIFIED" | "ACCOUNT_TYPE_PERSONAL" | "ACCOUNT_TYPE_ORGANIZATION" | number | string;
  org_name?: string;
  org_domain?: string;
  industry?: string;
  created_at?: string;
}

export interface Branding {
  company_name?: string;
  logo_url?: string;
  brand_color?: string;
}

interface SignupParams {
  email: string;
  password: string;
  account_type: "ACCOUNT_TYPE_PERSONAL" | "ACCOUNT_TYPE_ORGANIZATION";
  org_name?: string;
  org_domain?: string;
  industry?: string;
}

interface AuthContextType {
  user: User | null;
  branding: Branding | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (params: SignupParams) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  branding: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  refreshMe: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getAuthToken);
  const [user, setUser] = useState<User | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply real-time brand colors to CSS variables
  useEffect(() => {
    if (branding?.brand_color) {
      document.documentElement.style.setProperty("--brand-accent", branding.brand_color);
      document.documentElement.style.setProperty(
        "--brand-accent-subtle",
        `${branding.brand_color}14` // ~8% opacity
      );
      document.documentElement.style.setProperty(
        "--brand-accent-border",
        `${branding.brand_color}33` // ~20% opacity
      );
    } else {
      document.documentElement.style.setProperty("--brand-accent", "#0f172a");
      document.documentElement.style.setProperty("--brand-accent-subtle", "rgba(15, 23, 42, 0.06)");
      document.documentElement.style.setProperty("--brand-accent-border", "rgba(15, 23, 42, 0.15)");
    }
  }, [branding]);

  const refreshMe = async () => {
    const curToken = getAuthToken();
    if (!curToken) {
      setUser(null);
      setBranding(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.GET("/v1/auth/me", {});
      if (res.data) {
        const u = res.data.user as User;
        const b = res.data.branding as Branding;
        setUser(u);
        setBranding(b);
      } else {
        setAuthToken(null);
        setTokenState(null);
        setUser(null);
        setBranding(null);
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.POST("/v1/auth/login", {
        body: { email, password },
      });

      if (res.error || !res.data?.token) {
        return { success: false, error: errText(res.error) };
      }

      const receivedToken = res.data.token;
      setAuthToken(receivedToken);
      setTokenState(receivedToken);
      if (res.data.user) {
        setUser(res.data.user as User);
      }

      await refreshMe();
      return { success: true };
    } catch (e) {
      return { success: false, error: errText(e) };
    }
  };

  const signup = async (params: SignupParams) => {
    try {
      const res = await api.POST("/v1/auth/signup", {
        body: {
          email: params.email,
          password: params.password,
          account_type: params.account_type,
          org_name: params.org_name,
          org_domain: params.org_domain,
          industry: params.industry,
        },
      });

      if (res.error || !res.data?.token) {
        return { success: false, error: errText(res.error) };
      }

      const receivedToken = res.data.token;
      setAuthToken(receivedToken);
      setTokenState(receivedToken);
      if (res.data.user) {
        setUser(res.data.user as User);
      }

      await refreshMe();
      return { success: true };
    } catch (e) {
      return { success: false, error: errText(e) };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    setBranding(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        branding,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

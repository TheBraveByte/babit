import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { api, clearSessionCookie, errText, getAuthToken, setAuthToken } from "@/api/client";

export interface User {
  id?: string;
  email?: string;
  account_type?:
    | "ACCOUNT_TYPE_UNSPECIFIED"
    | "ACCOUNT_TYPE_PERSONAL"
    | "ACCOUNT_TYPE_ORGANIZATION"
    | number
    | string;
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

function isValidHexColor(s: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getAuthToken);
  const [user, setUser] = useState<User | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const color = branding?.brand_color;
    if (color && isValidHexColor(color)) {
      document.documentElement.style.setProperty("--brand-accent", color);
      document.documentElement.style.setProperty("--brand-accent-subtle", `${color}14`);
      document.documentElement.style.setProperty("--brand-accent-border", `${color}33`);
    } else {
      document.documentElement.style.removeProperty("--brand-accent");
      document.documentElement.style.removeProperty("--brand-accent-subtle");
      document.documentElement.style.removeProperty("--brand-accent-border");
    }
  }, [branding]);

  const refreshMe = async () => {
    // Try with the in-memory token first, then rely on the httpOnly cookie
    try {
      const res = await api.GET("/v1/auth/me", {});
      if (res.data) {
        const u = res.data.user as User;
        const b = res.data.branding as Branding;
        setUser(u);
        setBranding(b);
        return;
      }
    } catch {}
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    setBranding(null);
    setIsLoading(false);
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
    clearSessionCookie();
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
        isAuthenticated: !!token || !!user,
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

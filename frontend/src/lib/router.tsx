import { useState, useEffect, createContext, useContext, type ReactNode } from "react";

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: "/",
  navigate: () => {},
});

export function RouterProvider({ children }: { children: ReactNode }) {
  const getPath = () => {
    const hash = window.location.hash.replace(/^#/, "");
    return hash || "/";
  };

  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const handleHashChange = () => {
      setPath(getPath());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to.startsWith("/") ? to : `/${to}`;
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function Link({
  to,
  children,
  className = "",
  onClick,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: ReactNode;
}) {
  const { navigate } = useRouter();

  return (
    <a
      href={`#${to.startsWith("/") ? to : `/${to}`}`}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
        onClick?.(e);
      }}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}

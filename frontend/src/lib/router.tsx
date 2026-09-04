import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: "/",
  navigate: () => {},
});

const getPath = () => window.location.pathname + window.location.search || "/";

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const handlePop = () => setPath(getPath());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const navigate = (to: string) => {
    const url = to.startsWith("/") ? to : `/${to}`;
    if (url === window.location.pathname + window.location.search) return;
    window.history.pushState(null, "", url);
    setPath(url);
    window.scrollTo(0, 0);
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
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
  const href = to.startsWith("/") ? to : `/${to}`;

  return (
    <a
      href={href}
      onClick={(e) => {
        // Let the browser handle modifier-clicks (new tab, new window, etc.)
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
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

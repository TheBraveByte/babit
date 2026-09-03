import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";

type Project = components["schemas"]["v1Project"];

interface ProjectCtx {
  projects: Project[];
  selected: Project | null;
  loading: boolean;
  error: string | null;
  selectProject: (p: Project) => void;
}

const ProjectContext = createContext<ProjectCtx | null>(null);

const STORAGE_KEY = "babit-selected-project";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectProject = useCallback((p: Project) => {
    setSelected(p);
    try {
      localStorage.setItem(STORAGE_KEY, p.id ?? "");
    } catch {}
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const res = await api.GET("/v1/projects", {
        params: { query: { page_size: 50, page_token: "" } },
      });
      if (!active) return;
      if (res.error) {
        setError(errText(res.error));
      } else {
        const list = res.data?.projects ?? [];
        setProjects(list);
        const stored = localStorage.getItem(STORAGE_KEY);
        const match = list.find((p) => p.id === stored) ?? list[0] ?? null;
        setSelected(match);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, selected, loading, error, selectProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside ProjectProvider");
  return ctx;
}

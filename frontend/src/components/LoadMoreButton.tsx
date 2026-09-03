interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export function LoadMoreButton({ onClick, loading, disabled }: LoadMoreButtonProps) {
  if (disabled) return null;
  return (
    <div className="flex justify-center py-6">
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-pill px-5 py-2 text-[13px] font-medium transition-opacity cursor-pointer hover:opacity-90 disabled:opacity-50"
        style={{
          backgroundColor: "var(--surface)",
          color: "var(--fg)",
          border: "1px solid var(--border)",
        }}
      >
        {loading ? "Loading…" : "Load more"}
      </button>
    </div>
  );
}

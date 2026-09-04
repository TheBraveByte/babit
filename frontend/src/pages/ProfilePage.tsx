import { useEffect, useState } from "react";
import { BabitLogo, IconGitHub, IconXLogo } from "@/lib/icons";
import { Link } from "@/lib/router";
import { ThemeToggle } from "@/lib/ThemeToggle";

type GitHubProfile = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
}

export function ProfilePage() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/github-profile.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <header
        className="h-14 px-6 flex items-center justify-between sticky top-0 z-30"
        style={{
          backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <BabitLogo className="w-5 h-5 text-[color:var(--fg)]" />
          <span className="font-semibold text-[15px] tracking-tight font-mono text-[color:var(--fg)]">
            babit
          </span>
        </Link>
        <ThemeToggle className="hover:bg-[var(--secondary)]" />
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        {loading || !profile ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-5 h-5 rounded-full animate-spin"
              style={{ border: "2px solid var(--border)", borderTopColor: "var(--brand-accent)" }}
            />
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              Loading profile…
            </span>
          </div>
        ) : (
          <div
            className="w-full max-w-md rounded-babit-lg p-8 space-y-6 animate-float-up"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <img
                src={profile.avatar_url}
                alt={profile.name || profile.login}
                className="w-24 h-24 rounded-full object-cover"
                style={{ border: "2px solid var(--brand-accent)" }}
              />
              <div className="space-y-1">
                <h1
                  className="text-2xl font-semibold tracking-tight"
                  style={{ color: "var(--fg)" }}
                >
                  {profile.name || profile.login}
                </h1>
                <p className="text-sm font-mono" style={{ color: "var(--muted)" }}>
                  @{profile.login}
                </p>
              </div>
              {profile.bio && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {profile.bio}
                </p>
              )}
            </div>
            <div
              className="flex flex-wrap items-center justify-center gap-3 text-xs"
              style={{ color: "var(--muted)" }}
            >
              {profile.location && (
                <span
                  className="px-2 py-1 rounded-babit-sm"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  {profile.location}
                </span>
              )}
              {profile.company && (
                <span
                  className="px-2 py-1 rounded-babit-sm"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  {profile.company}
                </span>
              )}
              {profile.blog && (
                <a
                  href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 rounded-babit-sm hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "var(--secondary)", color: "var(--brand-accent)" }}
                >
                  {profile.blog.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Repos", value: profile.public_repos },
                { label: "Followers", value: profile.followers },
                { label: "Following", value: profile.following },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3 rounded-babit-sm space-y-1"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  <div className="text-lg font-medium tnum" style={{ color: "var(--fg)" }}>
                    {formatNumber(stat.value)}
                  </div>
                  <div
                    className="text-[10px] font-mono uppercase tracking-wider"
                    style={{ color: "var(--muted)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3">
              <a
                href={profile.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-babit-sm text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--fg)",
                  color: "var(--surface)",
                }}
              >
                <IconGitHub className="w-4 h-4" />
                GitHub
              </a>
              {profile.twitter_username && (
                <a
                  href={`https://x.com/${profile.twitter_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-babit-sm text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: "var(--secondary)",
                    color: "var(--fg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <IconXLogo className="w-4 h-4" />X
                </a>
              )}
            </div>
            <div className="text-center text-xs font-mono" style={{ color: "var(--muted)" }}>
              On GitHub since {formatDate(profile.created_at)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

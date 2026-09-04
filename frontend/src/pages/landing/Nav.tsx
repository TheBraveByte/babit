import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { BabitLogo } from "@/lib/icons";
import { Link, useRouter } from "@/lib/router";
import { ThemeToggle } from "@/lib/ThemeToggle";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "How it works", href: "/#how" },
    { label: "Who it's for", href: "/#who" },
    { label: "Developers", href: "/#developers" },
    { label: "Security", href: "/security" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "glass-subtle border-b border-[color:var(--border)]"
          : "border-b border-transparent"
      }`}
      style={{
        height: 64,
        background: !scrolled
          ? "linear-gradient(to bottom, var(--bg) 0%, color-mix(in srgb, var(--bg) 72%, transparent) 70%, transparent 100%)"
          : undefined,
      }}
    >
      <div className="container-babit h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <BabitLogo className="w-[20px] h-[20px] text-[color:var(--fg)]" />
          <span className="font-semibold text-[15px] tracking-tight text-[color:var(--fg)]">
            babit
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/api"
            className="text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
          >
            API
          </Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle className="hover:bg-[var(--secondary)]" />
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="hidden sm:inline-flex items-center px-3.5 py-1.5 text-[13px] font-medium rounded-pill hover:opacity-90 transition-opacity cursor-pointer"
              style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
            >
              Console →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="hidden sm:inline-flex text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors cursor-pointer px-2.5 py-1.5"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="hidden sm:inline-flex px-3.5 py-1.5 text-[13px] font-medium rounded-pill hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
              >
                Start free
              </button>
            </>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[color:var(--fg)]"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div
          id="landing-mobile-menu"
          className="md:hidden glass-subtle border-b border-[color:var(--border)] px-6 pt-2 pb-4 space-y-1 animate-fade-in"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left py-2.5 text-[14px] text-[color:var(--fg)] font-medium"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/api"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left py-2.5 text-[14px] text-[color:var(--fg)] font-medium"
          >
            API
          </Link>
          <div className="pt-3 mt-2 border-t border-[color:var(--border-subtle)] flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full text-center py-2.5 text-[14px] rounded-babit font-medium"
                style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
              >
                Console →
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="w-full text-center py-2.5 text-[14px] text-[color:var(--fg)] font-medium"
                >
                  Sign in
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/signup");
                  }}
                  className="w-full text-center py-2.5 text-[14px] rounded-babit font-medium"
                  style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
                >
                  Start free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

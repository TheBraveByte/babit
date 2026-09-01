import { useState, useEffect } from "react";
import { BabitLogo } from "@/lib/icons";
import { Link, useRouter } from "@/lib/router";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/lib/ThemeToggle";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "How it works", href: "#how" },
    { label: "Developers", href: "#developers" },
    { label: "Verify", href: "#security" },
  ];

  const scrollTo = (hash: string) => {
    setMobileMenuOpen(false);
    const id = hash.replace("#", "");
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-150 ${
        scrolled
          ? "bg-[var(--bg)]/90 backdrop-blur-md border-b border-[color:var(--border)] py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <BabitLogo className="w-5 h-5 text-[color:var(--fg)]" />
          <span className="font-semibold text-[15px] tracking-tight font-mono text-[color:var(--fg)]">
            babit
          </span>
        </Link>

        {/* Desktop Nav - 14-15px typography */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.href)}
              className="text-[14px] font-medium text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          <ThemeToggle className="hover:bg-[var(--secondary)]" />
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-[14px] font-medium bg-[var(--fg)] text-[var(--surface)] rounded-babit hover:opacity-90 transition-all cursor-pointer shadow-2xs"
            >
              Console →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-[14px] font-medium text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors cursor-pointer px-2.5 py-1.5"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 text-[14px] font-medium bg-[var(--fg)] text-[var(--surface)] rounded-babit hover:opacity-90 transition-all cursor-pointer shadow-2xs"
              >
                Get started
              </button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[color:var(--fg)]"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--surface)] border-b border-[color:var(--border)] px-4 pt-2 pb-4 space-y-2 animate-fade-in shadow-md">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.href)}
              className="block w-full text-left py-2.5 text-[14px] text-[color:var(--fg)] font-medium"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-[color:var(--border-subtle)] flex flex-col gap-2">
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
              className="w-full text-center py-2.5 text-[14px] bg-[var(--fg)] text-[var(--surface)] rounded-babit font-medium"
            >
              Get started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

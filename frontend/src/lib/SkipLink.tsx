import { useEffect, useState } from "react";

export function SkipLink() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Tab") setVisible(true);
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const handleClick = () => {
    const main = document.querySelector("main, #main-content");
    if (main instanceof HTMLElement) {
      main.setAttribute("tabindex", "-1");
      main.focus();
      main.scrollIntoView({ behavior: "smooth" });
      main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
      className="fixed top-4 left-4 z-[100] px-4 py-2.5 rounded-babit text-sm font-medium transition-opacity"
      style={{
        backgroundColor: "var(--brand-accent)",
        color: "var(--surface)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      Skip to main content
    </a>
  );
}

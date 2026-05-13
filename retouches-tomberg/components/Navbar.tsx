"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Phone } from "lucide-react";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "Horaires", href: "#horaires" },
  { label: "Contact", href: "#contact" },
];

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"FR" | "NL">("FR");
  const navRef = useRef<HTMLElement>(null);

  // Transparent → solid on scroll
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 60);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  return (
    <nav
      ref={navRef}
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#1B2A41]/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent",
      ].join(" ")}
      aria-label="Navigation principale"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Brand */}
          <a
            href="#"
            className="font-[family-name:var(--font-fraunces)] text-xl font-bold tracking-tight text-white hover:text-white/80 transition-colors shrink-0"
          >
            Retouches <span className="text-[#C44536]">Tomberg</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => {
              const sectionId = href.slice(1);
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={href}
                  href={href}
                  className={[
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-white bg-white/15"
                      : "text-white/80 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  {label}
                </a>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex text-xs font-semibold border border-white/25 rounded-full overflow-hidden">
              {(["FR", "NL"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={[
                    "px-3 py-1.5 transition-colors",
                    lang === l
                      ? "bg-white text-[#1B2A41]"
                      : "text-white/70 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                  aria-pressed={lang === l}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Phone CTA */}
            <a
              href="tel:+3227726340"
              className="inline-flex items-center gap-2 bg-[#C44536] hover:bg-[#a8392c] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-lg"
            >
              <Phone size={14} />
              02 772 63 40
            </a>
          </div>

          {/* Mobile: lang + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex text-xs font-semibold border border-white/25 rounded-full overflow-hidden">
              {(["FR", "NL"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={[
                    "px-2.5 py-1 transition-colors",
                    lang === l
                      ? "bg-white text-[#1B2A41]"
                      : "text-white/70 hover:text-white",
                  ].join(" ")}
                  aria-pressed={lang === l}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Ouvrir le menu de navigation"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-[#1B2A41]/95 backdrop-blur-md border-t border-white/10 px-4 pb-5 pt-3 space-y-1"
        >
          {NAV_LINKS.map(({ label, href }) => {
            const sectionId = href.slice(1);
            const isActive = activeSection === sectionId;
            return (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={[
                  "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "text-white bg-white/15"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                ].join(" ")}
              >
                {label}
              </a>
            );
          })}
          <a
            href="tel:+3227726340"
            onClick={() => setMenuOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 bg-[#C44536] hover:bg-[#a8392c] text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
          >
            <Phone size={16} />
            02 772 63 40
          </a>
        </div>
      )}
    </nav>
  );
}

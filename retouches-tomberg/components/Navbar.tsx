"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

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
  const [lang, setLang] = useState<"FR" | "NL">("FR");
  const navRef = useRef<HTMLElement>(null);

  // IntersectionObserver to track active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
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

  function handleLinkClick() {
    setMenuOpen(false);
  }

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 bg-[#1B2A41] text-white shadow-md"
      aria-label="Navigation principale"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <a
            href="#"
            className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight text-white hover:opacity-90 transition-opacity shrink-0"
          >
            Retouches Tomberg
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
                  className={
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors " +
                    (isActive
                      ? "text-white bg-white/10"
                      : "text-white/80 hover:text-white hover:bg-white/10")
                  }
                >
                  {label}
                </a>
              );
            })}
          </div>

          {/* Right side: lang switcher + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center gap-0.5 text-sm font-medium">
              <button
                onClick={() => setLang("FR")}
                className={
                  "px-2 py-1 rounded-l-md border border-white/30 transition-colors " +
                  (lang === "FR"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10")
                }
                aria-pressed={lang === "FR"}
              >
                FR
              </button>
              <button
                onClick={() => setLang("NL")}
                className={
                  "px-2 py-1 rounded-r-md border border-white/30 border-l-0 transition-colors " +
                  (lang === "NL"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10")
                }
                aria-pressed={lang === "NL"}
              >
                NL
              </button>
            </div>

            {/* Phone CTA */}
            <a
              href="tel:+3227726340"
              className="inline-flex items-center gap-1.5 bg-[#C44536] hover:bg-[#a8392c] text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors whitespace-nowrap"
            >
              📞 02 772 63 40
            </a>
          </div>

          {/* Mobile: lang + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-0.5 text-xs font-medium">
              <button
                onClick={() => setLang("FR")}
                className={
                  "px-1.5 py-0.5 rounded-l-md border border-white/30 transition-colors " +
                  (lang === "FR"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white")
                }
                aria-pressed={lang === "FR"}
              >
                FR
              </button>
              <button
                onClick={() => setLang("NL")}
                className={
                  "px-1.5 py-0.5 rounded-r-md border border-white/30 border-l-0 transition-colors " +
                  (lang === "NL"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white")
                }
                aria-pressed={lang === "NL"}
              >
                NL
              </button>
            </div>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Ouvrir le menu de navigation"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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
          className="md:hidden bg-[#1B2A41] border-t border-white/10 px-4 pb-4 pt-2 space-y-1"
        >
          {NAV_LINKS.map(({ label, href }) => {
            const sectionId = href.slice(1);
            const isActive = activeSection === sectionId;
            return (
              <a
                key={href}
                href={href}
                onClick={handleLinkClick}
                className={
                  "block px-3 py-2.5 rounded-md text-sm font-medium transition-colors " +
                  (isActive
                    ? "text-white bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/10")
                }
              >
                {label}
              </a>
            );
          })}
          <a
            href="tel:+3227726340"
            onClick={handleLinkClick}
            className="mt-3 flex items-center justify-center gap-1.5 bg-[#C44536] hover:bg-[#a8392c] text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors"
          >
            📞 02 772 63 40
          </a>
        </div>
      )}
    </nav>
  );
}

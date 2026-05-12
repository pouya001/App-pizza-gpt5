import siteConfig from "@/data/site-config.json";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "Horaires", href: "#horaires" },
  { label: "Contact", href: "#contact" },
];

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
];

export default function Footer() {
  const [phone1, phone2] = siteConfig.phones;

  return (
    <footer className="bg-[#2D2D2D] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Left — Brand block */}
          <div>
            <p className="font-[family-name:var(--font-fraunces)] text-white text-xl font-bold">
              {siteConfig.name}
            </p>
            <p className="text-white/60 text-sm mt-1">
              Atelier de couture &amp; retouches
            </p>
            <address className="not-italic text-white/60 text-sm mt-3">
              {siteConfig.address.street}, {siteConfig.address.postalCode}{" "}
              {siteConfig.address.city}
            </address>
            <div className="mt-2 space-y-1">
              <a
                href={`tel:${phone1.number}`}
                className="block text-white/80 hover:text-white text-sm transition-colors"
              >
                {phone1.display}
              </a>
              <a
                href={`tel:${phone2.number}`}
                className="block text-white/80 hover:text-white text-sm transition-colors"
              >
                {phone2.display}
              </a>
            </div>
          </div>

          {/* Right — Quick links */}
          <nav aria-label="Navigation secondaire">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
              Navigation
            </p>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/40 hover:text-white/70 text-xs transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <p>
              &copy; {new Date().getFullYear()} {siteConfig.name}. Tous droits
              réservés.
            </p>
            <p>Site réalisé avec Next.js · Hébergé par Vercel</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

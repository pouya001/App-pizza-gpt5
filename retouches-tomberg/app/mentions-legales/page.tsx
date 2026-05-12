import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions légales — Retouches Tomberg",
  description: "Mentions légales du site web Retouches Tomberg, atelier de couture à Woluwe-Saint-Lambert.",
  robots: { index: false, follow: false },
};

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#F5F1EA]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#1B2A41] hover:text-[#C44536] transition-colors mb-8 text-sm font-medium"
        >
          <ChevronLeft size={16} />
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-4xl font-[family-name:var(--font-fraunces)] font-bold text-[#1B2A41] mb-2">
          Mentions légales
        </h1>
        <p className="text-gray-500 text-sm mb-10">Dernière mise à jour : mai 2026</p>

        <div className="space-y-10 text-[#2D2D2D]">
          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              1. Éditeur du site
            </h2>
            <div className="bg-white rounded-xl p-6 space-y-2 text-sm leading-relaxed">
              <p><strong>Nom commercial :</strong> Retouches Tomberg</p>
              <p><strong>Adresse :</strong> Tomberg 93, 1200 Woluwe-Saint-Lambert, Belgique</p>
              <p>
                <strong>Téléphone :</strong>{" "}
                <a href="tel:+3227726340" className="text-[#C44536] hover:underline">02 772 63 40</a>
                {" / "}
                <a href="tel:+32476201474" className="text-[#C44536] hover:underline">0476 20 14 74</a>
              </p>
              <p>
                <strong>Numéro BCE :</strong> À compléter
              </p>
              <p>
                <strong>Numéro de TVA :</strong> À compléter (si assujetti)
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              2. Hébergement
            </h2>
            <div className="bg-white rounded-xl p-6 space-y-2 text-sm leading-relaxed">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
              <p>
                <strong>Site web :</strong>{" "}
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#C44536] hover:underline">
                  vercel.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              3. Propriété intellectuelle
            </h2>
            <div className="bg-white rounded-xl p-6 text-sm leading-relaxed">
              <p>
                L&apos;ensemble des contenus présents sur ce site (textes, images, logos, icônes) sont la propriété
                exclusive de Retouches Tomberg ou de leurs auteurs respectifs. Toute reproduction, représentation,
                modification ou exploitation, totale ou partielle, est interdite sans autorisation préalable.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              4. Limitation de responsabilité
            </h2>
            <div className="bg-white rounded-xl p-6 text-sm leading-relaxed space-y-3">
              <p>
                Retouches Tomberg s&apos;efforce de fournir des informations exactes et à jour sur ce site.
                Cependant, les informations (horaires, tarifs) sont données à titre indicatif et peuvent évoluer
                sans préavis. Nous vous recommandons de contacter directement l&apos;atelier pour confirmer ces informations.
              </p>
              <p>
                Retouches Tomberg ne saurait être tenu responsable des dommages directs ou indirects résultant
                de l&apos;utilisation de ce site ou de l&apos;impossibilité d&apos;y accéder.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              5. Droit applicable
            </h2>
            <div className="bg-white rounded-xl p-6 text-sm leading-relaxed">
              <p>
                Le présent site est soumis au droit belge. En cas de litige, les tribunaux compétents de
                l&apos;arrondissement judiciaire de Bruxelles seront seuls compétents.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
          <Link href="/politique-confidentialite" className="hover:text-[#C44536] transition-colors">
            Politique de confidentialité →
          </Link>
          <Link href="/" className="hover:text-[#C44536] transition-colors sm:ml-auto">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

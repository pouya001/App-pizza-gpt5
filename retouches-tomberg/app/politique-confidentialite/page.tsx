import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Retouches Tomberg",
  description: "Politique de confidentialité et protection des données personnelles du site Retouches Tomberg.",
  robots: { index: false, follow: false },
};

export default function PolitiqueConfidentialite() {
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
          Politique de confidentialité
        </h1>
        <p className="text-gray-500 text-sm mb-10">Dernière mise à jour : mai 2026</p>

        <div className="space-y-10 text-[#2D2D2D]">
          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              1. Responsable du traitement
            </h2>
            <div className="bg-white rounded-xl p-6 text-sm leading-relaxed">
              <p>
                Le responsable du traitement des données personnelles collectées via ce site est :
                <br /><strong>Retouches Tomberg</strong>, Tomberg 93, 1200 Woluwe-Saint-Lambert, Belgique.
                <br />Contact : <a href="tel:+3227726340" className="text-[#C44536] hover:underline">02 772 63 40</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              2. Données collectées
            </h2>
            <div className="bg-white rounded-xl p-6 text-sm leading-relaxed space-y-3">
              <p>
                Ce site vitrine ne collecte <strong>aucune donnée personnelle directement</strong>.
                Aucun formulaire de contact, aucune inscription, aucun compte utilisateur.
              </p>
              <p>
                Les seules interactions possibles sont :
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Appel téléphonique via les liens <code>tel:</code> (traité par votre opérateur)</li>
                <li>Itinéraire via Google Maps (traité par Google)</li>
                <li>Message WhatsApp (traité par Meta)</li>
              </ul>
              <p>
                L&apos;utilisation de ces services tiers est soumise à leurs propres politiques de confidentialité.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              3. Cookies et traceurs
            </h2>
            <div className="bg-white rounded-xl p-6 text-sm leading-relaxed space-y-3">
              <p>
                Ce site <strong>n&apos;utilise pas de cookies publicitaires ou de tracking</strong>.
              </p>
              <p>
                Des analyses d&apos;audience anonymes peuvent être collectées via Vercel Analytics,
                un outil <em>cookieless</em> qui ne permet pas d&apos;identifier les utilisateurs individuellement
                et est conforme au RGPD sans nécessiter de bannière de consentement.
              </p>
              <p>
                Si vous choisissez d&apos;afficher la carte Google Maps intégrée, Google peut déposer des cookies
                conformément à sa politique de confidentialité. Nous vous en informons avant le chargement de la carte
                et ce chargement ne se fait que sur votre action explicite.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              4. Hébergement et transferts de données
            </h2>
            <div className="bg-white rounded-xl p-6 text-sm leading-relaxed space-y-3">
              <p>
                Ce site est hébergé par <strong>Vercel Inc.</strong> (États-Unis). Le transfert vers un pays
                hors UE est encadré par les clauses contractuelles types de la Commission européenne.
              </p>
              <p>
                Les données de trafic anonymisées collectées par Vercel Analytics sont traitées conformément
                au RGPD et ne sont pas partagées avec des tiers à des fins publicitaires.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              5. Vos droits (RGPD)
            </h2>
            <div className="bg-white rounded-xl p-6 text-sm leading-relaxed space-y-3">
              <p>
                Conformément au Règlement général sur la protection des données (RGPD) et à la loi belge
                du 30 juillet 2018, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Droit d&apos;accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l&apos;effacement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d&apos;opposition</li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous au <a href="tel:+3227726340" className="text-[#C44536] hover:underline">02 772 63 40</a>.
              </p>
              <p>
                Vous pouvez également introduire une réclamation auprès de l&apos;Autorité de protection
                des données belge (APD) : <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="text-[#C44536] hover:underline">autoriteprotectiondonnees.be</a>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-4">
              6. Modification de cette politique
            </h2>
            <div className="bg-white rounded-xl p-6 text-sm leading-relaxed">
              <p>
                Cette politique de confidentialité peut être mise à jour à tout moment. La date de dernière
                modification est indiquée en haut de page. Nous vous encourageons à la consulter régulièrement.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
          <Link href="/mentions-legales" className="hover:text-[#C44536] transition-colors">
            Mentions légales →
          </Link>
          <Link href="/" className="hover:text-[#C44536] transition-colors sm:ml-auto">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

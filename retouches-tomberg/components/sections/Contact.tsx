import { Phone, MapPin, MessageCircle, Navigation } from "lucide-react";
import siteConfig from "@/data/site-config.json";

export default function Contact() {
  const [phone1, phone2] = siteConfig.phones;

  return (
    <section id="contact" className="bg-[#1B2A41] text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-4xl font-[family-name:var(--font-fraunces)] text-white">
          Contact &amp; accès
        </h2>
        <p className="text-white/70 mt-4">
          Venez nous rendre visite ou appelez-nous directement
        </p>

        {/* Contact cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1 — Phone */}
          <div className="bg-white/10 rounded-2xl p-6 text-left border border-white/20">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Phone size={18} className="text-[#C44536]" />
              Téléphone
            </h3>

            <a
              href={`tel:${phone1.number}`}
              className="flex items-center gap-3 mt-4 text-white hover:text-[#C44536] transition-colors"
            >
              <Phone size={16} className="shrink-0" />
              <span className="text-sm">
                <span className="font-medium">{phone1.label}</span>{" "}
                <span>{phone1.display}</span>
              </span>
            </a>

            <a
              href={`tel:${phone2.number}`}
              className="flex items-center gap-3 mt-3 text-white hover:text-[#C44536] transition-colors"
            >
              <Phone size={16} className="shrink-0" />
              <span className="text-sm">
                <span className="font-medium">{phone2.label}</span>{" "}
                <span>{phone2.display}</span>
              </span>
            </a>

            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <MessageCircle size={16} />
              WhatsApp — devis rapide
            </a>
          </div>

          {/* Card 2 — Address */}
          <div className="bg-white/10 rounded-2xl p-6 text-left border border-white/20">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MapPin size={18} className="text-[#C44536]" />
              Adresse
            </h3>

            <address className="not-italic mt-4 space-y-0.5">
              <p className="text-white font-bold text-sm">
                {siteConfig.address.street}
              </p>
              <p className="text-white/80 text-sm">
                {siteConfig.address.postalCode} {siteConfig.address.city}
              </p>
              <p className="text-white/60 text-sm">
                {siteConfig.address.countryName}
              </p>
            </address>

            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Navigation size={16} />
              Ouvrir dans Google Maps
            </a>
          </div>
        </div>

        {/* Primary phone CTA */}
        <div className="mt-10">
          <a
            href={`tel:${phone1.number}`}
            className="bg-[#C44536] hover:bg-[#a33929] text-white font-bold text-xl px-10 py-5 rounded-full flex items-center justify-center gap-3 max-w-md mx-auto transition-colors"
          >
            <Phone size={24} />
            {phone1.display}
          </a>
        </div>
      </div>
    </section>
  );
}

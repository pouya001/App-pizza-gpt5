"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2519.0!2d4.4317!3d50.853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3c50e00000001%3A0x0!2zUmV0b3VjaGVzIFRvbWJlcmc!5e0!3m2!1sfr!2sbe!4v1";

export default function MapEmbed() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="h-64 md:h-80 w-full rounded-xl overflow-hidden bg-gray-100 relative">
      {accepted ? (
        <iframe
          src={MAP_SRC}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Localisation Retouches Tomberg sur Google Maps"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center bg-[#F5F1EA]">
          <div className="flex flex-col items-center gap-2">
            <MapPin
              size={40}
              className="text-[#1B2A41]"
              aria-hidden="true"
            />
            <p className="text-[#2D2D2D] font-medium text-base">
              Tomberg 93, 1200 Woluwe-Saint-Lambert
            </p>
          </div>

          <button
            onClick={() => setAccepted(true)}
            className="bg-[#1B2A41] hover:bg-[#15223a] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2A41]"
          >
            Afficher la carte Google Maps
          </button>

          <p className="text-xs text-[#2D2D2D]/60 max-w-xs leading-relaxed">
            En affichant la carte, vous acceptez que Google Maps charge des
            données depuis ses serveurs. Consultez la{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[#1B2A41] transition-colors"
            >
              politique de confidentialité de Google
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}

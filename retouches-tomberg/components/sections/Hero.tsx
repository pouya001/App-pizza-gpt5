import { Phone, MapPin, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#1B2A41] flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle diagonal gradient overlay for texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 60%, rgba(196,69,54,0.08) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 md:py-32 text-center text-white">
        {/* Eyebrow */}
        <p className="text-[#C44536] uppercase tracking-widest text-sm font-semibold mb-4">
          Woluwe-Saint-Lambert · Tomberg
        </p>

        {/* H1 */}
        <h1 className="text-5xl md:text-7xl font-[family-name:var(--font-fraunces)] font-bold leading-tight text-white">
          Retouches Tomberg
        </h1>

        {/* H2 / subtitle */}
        <p className="text-xl md:text-2xl text-white/80 mt-4">
          Atelier de couture &amp; retouches
        </p>

        {/* Description */}
        <p className="text-white/70 mt-4 max-w-2xl mx-auto leading-relaxed">
          Ourlets, ajustements, réparations, transformations. Spécialiste cuir
          &amp; daim depuis 1995. Hommes · Femmes · Enfants.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="tel:+3227726340"
            className="bg-[#C44536] hover:bg-[#a33929] text-white font-semibold px-8 py-4 rounded-full flex items-center gap-2 text-lg transition-colors"
          >
            <Phone size={20} />
            Appeler le 02 772 63 40
          </a>
          <a
            href="https://maps.google.com/?q=Tomberg+93+1200+Woluwe-Saint-Lambert"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white text-white hover:bg-white hover:text-[#1B2A41] px-8 py-4 rounded-full flex items-center gap-2 text-lg transition-colors"
          >
            <MapPin size={20} />
            Itinéraire
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          <span className="bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm border border-white/20">
            🚇 Métro Tomberg à 2 min
          </span>
          <span className="bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm border border-white/20">
            ✂️ Hommes • Femmes • Enfants
          </span>
          <span className="bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm border border-white/20">
            🥇 Spécialiste cuir &amp; daim
          </span>
        </div>
      </div>

      {/* Scroll-down arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/60">
        <ChevronDown size={32} />
      </div>
    </section>
  );
}

import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";

export default function Atelier() {
  return (
    <section className="bg-[#1B2A41] py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <p className="text-[#C44536] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
            Notre espace
          </p>
          <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-fraunces)] font-bold text-white">
            L&apos;atelier
          </h2>
          <p className="text-white/60 mt-4 max-w-xl mx-auto">
            Un espace professionnel pensé pour la précision — machines Juki,
            centaines de fils, table de repassage professionnelle.
          </p>
        </FadeIn>

        {/* Photo grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Large left image: facade */}
          <FadeIn
            direction="right"
            className="md:col-span-5 relative h-80 md:h-[520px] rounded-2xl overflow-hidden group"
          >
            <Image
              src="/images/facade.jpg"
              alt="Devanture de l'atelier Retouches Tomberg, Tomberg 93 Woluwe-Saint-Lambert"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A41]/70 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="text-white font-[family-name:var(--font-fraunces)] text-xl font-bold">
                Tomberg 93
              </p>
              <p className="text-white/70 text-sm">Woluwe-Saint-Lambert</p>
            </div>
          </FadeIn>

          {/* Right column: two stacked images */}
          <div className="md:col-span-7 grid grid-rows-2 gap-4">
            <FadeIn
              direction="left"
              delay={0.15}
              className="relative h-56 md:h-auto rounded-2xl overflow-hidden group"
            >
              <Image
                src="/images/atelier-3.jpg"
                alt="Vue panoramique de l'atelier de couture Retouches Tomberg"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#1B2A41]/30" />
            </FadeIn>

            <FadeIn
              direction="left"
              delay={0.3}
              className="relative h-56 md:h-auto rounded-2xl overflow-hidden group"
            >
              <Image
                src="/images/atelier-1.jpg"
                alt="Fils et machines à coudre dans l'atelier Retouches Tomberg"
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent to-[#1B2A41]/20" />
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-[#C44536] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                ⭐ Spécialiste cuir & daim
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Stats row */}
        <FadeIn delay={0.2} className="mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "30+", label: "Années d'expérience" },
              { value: "6", label: "Services proposés" },
              { value: "2", label: "Numéros de téléphone" },
              { value: "100%", label: "Artisanal" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="text-center border border-white/10 rounded-2xl py-6 px-4 bg-white/5 backdrop-blur-sm"
              >
                <p className="text-4xl font-[family-name:var(--font-fraunces)] font-bold text-[#C44536]">
                  {value}
                </p>
                <p className="text-white/60 text-sm mt-2">{label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

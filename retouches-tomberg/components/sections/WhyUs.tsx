import { Scissors, Award, Zap, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

interface WhyUsItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const items: WhyUsItem[] = [
  {
    icon: Scissors,
    title: "Artisan expérimenté",
    description:
      "Des années de savoir-faire pour des retouches de qualité, quelle que soit la complexité du travail.",
  },
  {
    icon: Award,
    title: "Spécialiste cuir & daim",
    description:
      "Une expertise rare et recherchée pour vos articles en cuir et daim les plus précieux.",
  },
  {
    icon: Zap,
    title: "Délais rapides",
    description:
      "La plupart des retouches simples sont prêtes sous 48h. Urgences possibles sur demande.",
  },
  {
    icon: Heart,
    title: "Conseil personnalisé",
    description:
      "Un atelier de quartier à l'écoute, qui prend le temps de comprendre vos besoins.",
  },
];

export default function WhyUs() {
  return (
    <section
      id="why-us"
      className="relative bg-[#F5F1EA] py-24 px-4 overflow-hidden"
    >
      {/* Decorative background shape */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-5 pointer-events-none"
        style={{ background: "#C44536" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <FadeIn className="text-center mb-14">
          <p className="text-[#C44536] uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Notre engagement
          </p>
          <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-fraunces)] font-bold text-[#1B2A41]">
            Pourquoi nous choisir&nbsp;?
          </h2>
          <p className="mt-4 text-gray-500 max-w-lg mx-auto">
            Un atelier de confiance au cœur de Woluwe-Saint-Lambert.
          </p>
        </FadeIn>

        {/* Items grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeIn
                key={item.title}
                delay={i * 0.1}
                direction={i % 2 === 0 ? "right" : "left"}
              >
                <div className="flex gap-5 items-start bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                  <div className="bg-[#1B2A41] rounded-xl flex items-center justify-center shrink-0 w-12 h-12 shadow-sm">
                    <Icon size={22} className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#1B2A41] font-[family-name:var(--font-fraunces)]">
                      {item.title}
                    </p>
                    <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

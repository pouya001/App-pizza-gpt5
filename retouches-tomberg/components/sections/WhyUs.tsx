import { Scissors, Award, Zap, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    <section id="why-us" className="bg-[#1B2A41] text-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-fraunces)] font-bold text-white">
            Pourquoi nous choisir&nbsp;?
          </h2>
          <p className="mt-3 text-white/70">
            Un atelier de confiance au cœur de Woluwe-Saint-Lambert.
          </p>
        </div>

        {/* Items grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-5 items-start">
                <div className="bg-[#C44536] rounded-xl flex items-center justify-center shrink-0 w-12 h-12">
                  <Icon size={24} className="text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white font-[family-name:var(--font-fraunces)]">
                    {item.title}
                  </p>
                  <p className="text-white/70 text-sm mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

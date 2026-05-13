import { Scissors, Ruler, Wrench, Star, Home, Sparkles } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import servicesData from "@/data/services.json";
import FadeIn from "@/components/ui/FadeIn";

type Service = {
  id: string;
  icon: string;
  titleFr: string;
  descFr: string;
  featured?: boolean;
};

const ICONS: Record<string, ComponentType<LucideProps>> = {
  Scissors,
  Ruler,
  Wrench,
  Star,
  Home,
  Sparkles,
};

const services = servicesData as Service[];

export default function Services() {
  return (
    <section id="services" className="bg-[#F5F1EA] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <FadeIn className="text-center mb-14">
          <p className="text-[#C44536] uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Savoir-faire
          </p>
          <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-fraunces)] text-[#1B2A41]">
            Nos services
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Du simple ourlet à la transformation complète — chaque pièce est
            traitée avec précision et savoir-faire.
          </p>
        </FadeIn>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => {
            const IconComponent = ICONS[service.icon];
            return (
              <FadeIn key={service.id} delay={i * 0.08} direction="up">
                <div
                  className={[
                    "bg-white rounded-2xl p-7 border transition-all duration-300 h-full",
                    "hover:shadow-lg hover:-translate-y-1",
                    service.featured
                      ? "relative ring-2 ring-[#C44536] border-transparent"
                      : "border-gray-100 shadow-sm",
                  ].join(" ")}
                >
                  {service.featured && (
                    <span className="absolute top-4 right-4 bg-[#C44536] text-white text-xs px-2.5 py-1 rounded-full font-medium">
                      Spécialité ⭐
                    </span>
                  )}

                  {/* Icon */}
                  <div className="w-12 h-12 bg-[#1B2A41] rounded-xl flex items-center justify-center mb-5 shadow-sm">
                    {IconComponent && (
                      <IconComponent size={22} className="text-white" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#1B2A41] font-[family-name:var(--font-fraunces)] mb-2">
                    {service.titleFr}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {service.descFr}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Scissors, Ruler, Wrench, Star, Home, Sparkles } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import servicesData from "@/data/services.json";

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
    <section id="services" className="bg-[#F5F1EA] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-4xl font-[family-name:var(--font-fraunces)] text-[#1B2A41]">
            Nos services
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Du simple ourlet à la transformation complète, notre atelier prend
            soin de chaque pièce avec précision et savoir-faire.
          </p>
        </div>

        {/* Cards grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const IconComponent = ICONS[service.icon];
            return (
              <div
                key={service.id}
                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100${
                  service.featured ? " relative ring-2 ring-[#C44536]" : ""
                }`}
              >
                {service.featured && (
                  <span className="absolute top-4 right-4 bg-[#C44536] text-white text-xs px-2 py-0.5 rounded-full">
                    Spécialité
                  </span>
                )}

                {/* Icon container */}
                <div className="w-10 h-10 bg-[#1B2A41]/10 rounded-xl flex items-center justify-center mb-4">
                  {IconComponent && (
                    <IconComponent size={24} className="text-[#1B2A41]" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[#1B2A41] font-[family-name:var(--font-fraunces)]">
                  {service.titleFr}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  {service.descFr}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

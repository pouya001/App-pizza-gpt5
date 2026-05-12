import { Info } from "lucide-react";
import pricingData from "@/data/pricing.json";

export default function Pricing() {
  return (
    <section id="tarifs" className="bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-fraunces)] font-bold text-[#1B2A41]">
            Tarifs indicatifs
          </h2>
          <p className="mt-3 text-gray-500 italic">{pricingData.note}</p>
        </div>

        {/* Notice banner */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-4 py-3 mt-6 text-sm flex items-start gap-2">
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            Devis gratuit en atelier. Ces prix sont indicatifs et peuvent varier
            selon le tissu et la complexité du travail.
          </span>
        </div>

        {/* Categories */}
        {pricingData.categories.map((category) => (
          <div key={category.id}>
            <h3 className="text-[#1B2A41] font-semibold text-sm uppercase tracking-wider mt-8 mb-3 border-b border-gray-200 pb-2">
              {category.labelFr}
            </h3>
            <div>
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <span className="text-[#2D2D2D] text-sm md:text-base">
                    {item.labelFr}
                  </span>
                  <span
                    className={`font-semibold text-sm md:text-base text-right ml-4 shrink-0 ${
                      item.priceFr === "Devis gratuit"
                        ? "text-[#C44536]"
                        : "text-[#1B2A41]"
                    }`}
                  >
                    {item.priceFr}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom CTA */}
        <p className="mt-8 text-center text-gray-600 text-sm md:text-base">
          Pour un devis précis, venez nous rendre visite à l&rsquo;atelier ou
          appelez-nous au{" "}
          <a
            href="tel:+3227726340"
            className="font-semibold text-[#1B2A41] hover:text-[#C44536] transition-colors"
          >
            02 772 63 40
          </a>
        </p>
      </div>
    </section>
  );
}

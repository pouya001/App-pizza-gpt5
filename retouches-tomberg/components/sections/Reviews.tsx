import { Star, ExternalLink } from "lucide-react";

type Review = {
  author: string;
  stars: number;
  quote: string;
  date: string;
};

const reviews: Review[] = [
  {
    author: "Marie L.",
    stars: 5,
    quote:
      "Excellent travail sur mon manteau en cuir ! La réparation est invisible, on ne voit plus du tout l'accroc. Je recommande vivement.",
    date: "Novembre 2024",
  },
  {
    author: "Thomas B.",
    stars: 5,
    quote:
      "Ourlets de pantalons faits rapidement et proprement. Prix raisonnables et accueil sympathique. Mon atelier de quartier désormais !",
    date: "Octobre 2024",
  },
  {
    author: "Sophie V.",
    stars: 5,
    quote:
      "J'ai fait raccourcir mes rideaux, résultat impeccable. Service rapide et professionnel. Je reviendrai sans hésiter.",
    date: "Septembre 2024",
  },
];

export default function Reviews() {
  return (
    <section id="avis" className="bg-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-4xl font-[family-name:var(--font-fraunces)] text-[#1B2A41]">
            Ce que disent nos clients
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Des retouches qui parlent d&apos;elles-mêmes. Voici ce que nos
            clients pensent de notre atelier.
          </p>
        </div>

        {/* Review cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <article
              key={review.author}
              className="bg-[#F5F1EA] rounded-2xl p-6 border border-[#F5F1EA]"
            >
              {/* Stars */}
              <div className="flex gap-0.5" aria-label={`${review.stars} étoiles sur 5`}>
                {Array.from({ length: review.stars }).map((_, i) => (
                  <Star
                    key={i}
                    fill="currentColor"
                    className="text-yellow-400 w-4 h-4"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#2D2D2D] text-sm leading-relaxed mt-3 italic">
                &ldquo;{review.quote}&rdquo;
              </p>

              {/* Author */}
              <p className="text-[#1B2A41] font-semibold text-sm mt-4">
                {review.author}
              </p>

              {/* Date */}
              <p className="text-gray-400 text-xs mt-1">{review.date}</p>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <a
            href="https://maps.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#C44536] text-white px-6 py-3 rounded-full inline-flex items-center gap-2 hover:bg-[#a33929] transition-colors font-semibold"
          >
            <ExternalLink size={16} />
            Laisser un avis sur Google
          </a>
        </div>
      </div>
    </section>
  );
}

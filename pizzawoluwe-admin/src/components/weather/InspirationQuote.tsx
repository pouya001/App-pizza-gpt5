'use client';

import { useEffect, useState } from 'react';

interface InspirationQuoteProps {
  condition: string;
}

const quotes = {
  clear: [
    "Le soleil brille pour tout le monde. Profite de cette belle journée ! ☀️",
    "Un ciel dégagé, une journée parfaite pour réaliser tes rêves.",
    "Laisse le soleil illuminer ton âme et réchauffer ton cœur.",
    "Chaque rayon de soleil est une opportunité de briller.",
    "Sous ce ciel bleu, tout semble possible !",
  ],
  clouds: [
    "Même derrière les nuages, le soleil brille toujours. ☁️",
    "Les nuages passent, ta détermination reste.",
    "Un ciel nuageux peut cacher les plus belles surprises.",
    "Les nuages donnent de la profondeur au ciel, comme les défis à la vie.",
    "Derrière chaque nuage se cache une éclaircie.",
  ],
  rain: [
    "La pluie nourrit la terre, comme les défis nourrissent l'âme. 🌧️",
    "Danse sous la pluie, c'est là que la magie opère !",
    "Après la pluie, vient toujours le beau temps.",
    "La pluie nettoie le monde et rafraîchit l'esprit.",
    "Chaque goutte de pluie est une bénédiction de la nature.",
  ],
  storm: [
    "Les tempêtes révèlent notre vraie force. ⛈️",
    "Dans la tempête, trouve ton calme intérieur.",
    "Après l'orage, l'arc-en-ciel est encore plus beau.",
    "Les tempêtes passent, mais ta résilience reste.",
    "C'est dans la tempête que les vrais capitaines se révèlent.",
  ],
  snow: [
    "Chaque flocon est unique, comme chaque instant de ta vie. ❄️",
    "La neige transforme le monde en conte de fées.",
    "Dans le silence de la neige, trouve la paix.",
    "Comme la neige, sois pur et laisse une belle empreinte.",
    "La beauté de la neige nous rappelle la magie de l'hiver.",
  ],
  mist: [
    "Dans la brume, fais confiance à ton intuition. 🌫️",
    "Le brouillard cache les détails mais révèle l'essentiel.",
    "Parfois, il faut du brouillard pour mieux voir clair.",
    "La brume crée du mystère, et dans le mystère naît l'émerveillement.",
    "Quand tout est flou, concentre-toi sur l'instant présent.",
  ],
  default: [
    "Chaque jour est une nouvelle aventure ! 🌤️",
    "La météo change, ton optimisme reste.",
    "Peu importe le temps, c'est ton attitude qui compte.",
    "Embrasse le jour tel qu'il est, c'est le seul que tu as.",
    "La vraie beauté se trouve dans tous les temps.",
  ],
};

export default function InspirationQuote({ condition }: InspirationQuoteProps) {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const conditionLower = condition.toLowerCase();
    let quoteArray = quotes.default;

    if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      quoteArray = quotes.clear;
    } else if (conditionLower.includes('cloud')) {
      quoteArray = quotes.clouds;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      quoteArray = quotes.rain;
    } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
      quoteArray = quotes.storm;
    } else if (conditionLower.includes('snow')) {
      quoteArray = quotes.snow;
    } else if (conditionLower.includes('mist') || conditionLower.includes('fog')) {
      quoteArray = quotes.mist;
    }

    const randomQuote = quoteArray[Math.floor(Math.random() * quoteArray.length)];
    setQuote(randomQuote);
  }, [condition]);

  return (
    <div className="bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/40 transform hover:scale-[1.01] transition-all duration-500">
      <div className="flex items-center gap-4">
        <div className="text-5xl">💭</div>
        <p className="text-white text-2xl md:text-3xl font-medium italic leading-relaxed">
          "{quote}"
        </p>
      </div>
    </div>
  );
}

import { MapPin, Train, Bus, Car } from "lucide-react";
import hoursData from "@/data/hours.json";
import OpenStatus from "@/components/OpenStatus";
import MapEmbed from "@/components/MapEmbed";

type DaySchedule = {
  day: string;
  dayFr: string;
  dayNl: string;
  open: string | null;
  close: string | null;
  closed: boolean;
};

const schedule = hoursData.schedule as DaySchedule[];

export default function Hours() {
  return (
    <section id="horaires" className="bg-[#F5F1EA] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-4xl font-[family-name:var(--font-fraunces)] text-[#1B2A41]">
            Horaires &amp; accès
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Retrouvez-nous du lundi au samedi à Woluwe-Saint-Lambert.
          </p>
          <div className="mt-4 flex justify-center">
            <OpenStatus className="mb-8" />
          </div>
        </div>

        {/* Two-column grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* LEFT — Schedule table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1B2A41] font-semibold mb-4">
              Horaires d&apos;ouverture
            </h3>
            <ul>
              {schedule.map((entry) => (
                <li
                  key={entry.day}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <span className="text-[#2D2D2D]">{entry.dayFr}</span>
                  {entry.closed ? (
                    <span className="text-[#C44536] font-medium">Fermé</span>
                  ) : (
                    <span className="text-[#1B2A41] font-medium">
                      {entry.open} – {entry.close}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — Access info + map */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1B2A41] font-semibold mb-4">
                Comment nous trouver
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://maps.google.com/?q=Tomberg+93+1200+Woluwe-Saint-Lambert"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-gray-700 text-sm hover:text-[#1B2A41] transition-colors"
                  >
                    <MapPin
                      size={18}
                      className="text-[#C44536] mt-0.5 shrink-0"
                    />
                    <span>Tomberg 93, 1200 Woluwe-Saint-Lambert</span>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-gray-700 text-sm">
                  <Train
                    size={18}
                    className="text-[#C44536] mt-0.5 shrink-0"
                  />
                  <span>Métro ligne 1 — arrêt Tomberg (2 min à pied)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700 text-sm">
                  <Bus size={18} className="text-[#C44536] mt-0.5 shrink-0" />
                  <span>Bus STIB 28</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700 text-sm">
                  <Car size={18} className="text-[#C44536] mt-0.5 shrink-0" />
                  <span>Parking en rue à proximité</span>
                </li>
              </ul>
              <a
                href="https://maps.google.com/?q=Tomberg+93+1200+Woluwe-Saint-Lambert"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-[#1B2A41] text-white rounded-lg py-3 flex items-center justify-center gap-2 text-sm font-semibold hover:bg-[#15223a] transition-colors"
              >
                <MapPin size={16} />
                Obtenir l&apos;itinéraire
              </a>
            </div>

            {/* Map embed */}
            <MapEmbed />
          </div>
        </div>
      </div>
    </section>
  );
}

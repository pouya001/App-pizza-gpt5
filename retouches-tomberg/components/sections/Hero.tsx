"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Phone, MapPin, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/atelier-2.jpg"
          alt="Intérieur de l'atelier Retouches Tomberg"
          fill
          priority
          className="object-cover object-center scale-105"
          sizes="100vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B2A41]/90 via-[#1B2A41]/78 to-[#1B2A41]/92" />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[#C44536] uppercase tracking-[0.3em] text-sm font-semibold mb-6"
        >
          Woluwe-Saint-Lambert · Tomberg 93
        </motion.p>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-6xl md:text-8xl font-[family-name:var(--font-fraunces)] font-bold text-white leading-none tracking-tight"
        >
          Retouches
          <br />
          <span className="text-[#C44536]">Tomberg</span>
        </motion.h1>

        {/* Animated divider */}
        <motion.div
          initial={{ scaleX: 0, originX: 0.5 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="w-20 h-px bg-[#C44536] mx-auto my-8"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-white/80 text-xl md:text-2xl font-[family-name:var(--font-fraunces)] mb-4"
        >
          Atelier de couture &amp; retouches
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Ourlets, ajustements, réparations, transformations.
          <br />
          Spécialiste{" "}
          <strong className="text-white/85">cuir &amp; daim</strong> depuis
          1995. Hommes · Femmes · Enfants.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="tel:+3227726340"
            className="group flex items-center gap-3 bg-[#C44536] hover:bg-[#a33929] text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Phone
              size={20}
              className="group-hover:rotate-12 transition-transform duration-300"
            />
            Appeler le 02 772 63 40
          </a>
          <a
            href="https://maps.google.com/?q=Tomberg+93+1200+Woluwe-Saint-Lambert"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 border-2 border-white/40 text-white hover:bg-white hover:text-[#1B2A41] px-8 py-4 rounded-full text-lg transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
          >
            <MapPin size={20} />
            Itinéraire
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-14"
        >
          {[
            "🚇 Métro Tomberg à 2 min",
            "✂️ Hommes • Femmes • Enfants",
            "🥇 Spécialiste cuir & daim",
          ].map((badge) => (
            <span
              key={badge}
              className="bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm border border-white/20"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.a
          href="#services"
          aria-label="Défiler vers le bas"
          className="text-white/40 hover:text-white/80 transition-colors block"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown size={32} />
        </motion.a>
      </motion.div>
    </section>
  );
}

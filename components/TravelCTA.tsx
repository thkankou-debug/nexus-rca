"use client";

import { motion } from "framer-motion";
import { Plane, Hotel, ArrowUpRight } from "lucide-react";

export function TravelCTA() {
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Flights */}
          <motion.a
            href="https://www.google.com/flights"
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-800 to-nexus-blue-950 p-10 text-white transition-transform hover:scale-[1.01]"
          >
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-nexus-orange-500/20 blur-3xl transition-all group-hover:scale-150" />
            <Plane className="mb-6 h-12 w-12 text-nexus-orange-400" />
            <h3 className="mb-2 font-display text-3xl font-bold sm:text-4xl">
              Rechercher un vol
            </h3>
            <p className="mb-8 max-w-md text-slate-300">
              Comparez les meilleurs prix sur des milliers d'itinéraires avec Google Flights.
              Accès direct, recherche en temps réel.
            </p>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-nexus-blue-900 transition-all group-hover:gap-3">
              Ouvrir Google Flights <ArrowUpRight className="h-4 w-4" />
            </span>
          </motion.a>

          {/* Hotels */}
          <motion.a
            href="https://www.skyscanner.net/hotels"
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 p-10 text-white transition-transform hover:scale-[1.01]"
          >
            <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-nexus-blue-500/30 blur-3xl transition-all group-hover:scale-150" />
            <Hotel className="mb-6 h-12 w-12 text-white" />
            <h3 className="mb-2 font-display text-3xl font-bold sm:text-4xl">
              Réserver un hôtel
            </h3>
            <p className="mb-8 max-w-md text-orange-50">
              Skyscanner compare des millions d'hôtels dans le monde entier. Confort garanti,
              meilleurs tarifs.
            </p>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-nexus-orange-700 transition-all group-hover:gap-3">
              Ouvrir Skyscanner <ArrowUpRight className="h-4 w-4" />
            </span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}

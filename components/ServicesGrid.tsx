"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/services";
import { cn } from "@/lib/utils";

export function ServicesGrid() {
  return (
    <section id="services" className="relative overflow-hidden bg-slate-50 py-24 lg:py-32">
      <div className="absolute inset-0 bg-mesh-gradient opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mb-4 inline-block rounded-full bg-nexus-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-700">
            Nos expertises
          </div>
          <h2 className="font-display text-4xl font-bold text-nexus-blue-950 sm:text-5xl md:text-6xl">
            Tout ce qu'il vous faut,{" "}
            <span className="text-gradient-nexus">sous un seul toit.</span>
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            Neuf services pensés pour ouvrir les portes internationales depuis la Centrafrique.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="group relative block h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl"
                >
                  {/* Hover gradient */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                      service.accent === "orange"
                        ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700"
                        : "bg-gradient-to-br from-nexus-blue-800 to-nexus-blue-950"
                    )}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={cn(
                        "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500",
                        service.accent === "orange"
                          ? "bg-nexus-orange-100 text-nexus-orange-600 group-hover:bg-white/20 group-hover:text-white"
                          : "bg-nexus-blue-100 text-nexus-blue-700 group-hover:bg-white/20 group-hover:text-white"
                      )}
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    {/* Number */}
                    <div className="absolute right-0 top-0 font-display text-5xl font-bold text-slate-100 transition-colors group-hover:text-white/20">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 font-display text-xl font-bold text-nexus-blue-950 transition-colors group-hover:text-white">
                      {service.title}
                    </h3>
                    <p className="mb-5 text-sm leading-relaxed text-slate-600 transition-colors group-hover:text-white/90">
                      {service.shortDesc}
                    </p>

                    {/* CTA */}
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-nexus-orange-600 transition-all group-hover:gap-2.5 group-hover:text-white">
                      En savoir plus
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

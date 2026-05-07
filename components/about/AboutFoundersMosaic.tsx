import Link from "next/link";
import { Linkedin, Mail, MapPin, Quote } from "lucide-react";

/**
 * Voix humaines — mosaïque cabinet des deux fondateurs.
 *
 * Style référence : McKinsey (présentation partners) × Deel (mosaïque équipe).
 * Pas de témoignages bidons, pas de sticker cheap.
 *
 * Layout :
 * - Desktop : 2 cards côte à côte (lg:grid-cols-2), chacune avec photo
 *   pleine hauteur à gauche + bio + liens à droite
 * - Mobile : stack vertical, photo aspect-square pleine largeur
 *
 * Photos préchargées via background-image — fallback automatique aux initiales
 * si image absente (jamais le cas mais sécurité).
 */

type Founder = {
  name: string;
  role: string;
  initials: string;
  bio: string;
  location: string;
  photo?: string;
  email?: string;
  linkedin?: string;
};

type Props = {
  founders: Founder[];
};

export function AboutFoundersMosaic({ founders }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      {founders.map((founder, idx) => (
        <article
          key={founder.name}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_28px_60px_-24px_rgba(255,102,0,0.30)]"
        >
          {/* Glow décoratif */}
          <div
            aria-hidden
            className={`pointer-events-none absolute h-44 w-44 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover:bg-nexus-orange-500/15 ${
              idx === 0
                ? "-right-12 -top-12"
                : "-left-12 -bottom-12"
            }`}
          />

          {/* Liseré supérieur */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-300/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          <div className="relative flex flex-col sm:flex-row">
            {/* ─── Photo / Initiales ─── */}
            <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-nexus-blue-900 via-nexus-blue-950 to-nexus-blue-900 sm:w-44 sm:shrink-0 lg:w-56">
              {/* Fallback initiales toujours présentes derrière */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-6xl font-bold text-white/15 sm:text-7xl">
                  {founder.initials}
                </span>
              </div>

              {/* Photo (par-dessus si elle existe) */}
              {founder.photo && (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${founder.photo})` }}
                />
              )}

              {/* Overlay gradient subtil bottom pour lisibilité */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
              />

              {/* Pill location en bas de la photo */}
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-nexus-blue-950/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
                <MapPin className="h-3 w-3 text-nexus-orange-300" />
                {founder.location}
              </div>
            </div>

            {/* ─── Bio ─── */}
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                {founder.role}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                {founder.name}
              </h3>

              {/* Citation en mini-extrait éditorial */}
              <div className="mt-5 flex gap-3">
                <Quote
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-nexus-orange-300/60"
                />
                <p className="flex-1 text-sm leading-relaxed text-slate-300">
                  {founder.bio}
                </p>
              </div>

              {/* Liens */}
              {(founder.email || founder.linkedin) && (
                <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5">
                  {founder.email && (
                    <Link
                      href={`mailto:${founder.email}`}
                      aria-label={`Email à ${founder.name}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur-md transition-all duration-200 hover:border-nexus-orange-400/40 hover:bg-white/[0.07] hover:text-white"
                    >
                      <Mail className="h-3 w-3" />
                      Email
                    </Link>
                  )}
                  {founder.linkedin && (
                    <Link
                      href={founder.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`LinkedIn de ${founder.name}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur-md transition-all duration-200 hover:border-nexus-blue-400/40 hover:bg-white/[0.07] hover:text-white"
                    >
                      <Linkedin className="h-3 w-3" />
                      LinkedIn
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

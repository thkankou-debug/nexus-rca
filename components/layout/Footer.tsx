import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle, Facebook, Instagram, Linkedin } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SERVICES } from "@/lib/services";
import { whatsappLink } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-nexus-blue-950 text-slate-300">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
      <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-nexus-orange-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-nexus-blue-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              De Bangui au monde. Agence internationale spécialisée visa, études au Canada,
              financement business et services administratifs.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-nexus-orange-500"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-nexus-orange-500"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-nexus-orange-500"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 font-display text-base font-bold text-white">Services</h3>
            <ul className="space-y-2 text-sm">
              {SERVICES.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-slate-400 transition hover:text-nexus-orange-400"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 font-display text-base font-bold text-white">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-nexus-orange-400">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-400 hover:text-nexus-orange-400">
                  Tous les services
                </Link>
              </li>
              <li>
                <Link href="/services/nexus-ia" className="text-slate-400 hover:text-nexus-orange-400">
                  Nexus IA 🤖
                </Link>
              </li>
              <li>
                <Link href="/demande" className="text-slate-400 hover:text-nexus-orange-400">
                  Faire une demande
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-nexus-orange-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-400 hover:text-nexus-orange-400">
                  Espace client
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-display text-base font-bold text-white">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-400" />
                <span className="text-slate-400">
                  Relais Sica, vers Hôpital Général
                  <br />
                  Bangui, République Centrafricaine
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-nexus-orange-400" />
                <a
                  href="tel:+15873276344"
                  className="text-slate-400 hover:text-nexus-orange-400"
                >
                  +1 587 327 6344
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 shrink-0 text-nexus-orange-400" />
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-nexus-orange-400"
                >
                  WhatsApp direct
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-nexus-orange-400" />
                <a
                  href="mailto:contact@nexus-rca.com"
                  className="text-slate-400 hover:text-nexus-orange-400"
                >
                  contact@nexus-rca.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Nexus RCA — Agence Internationale. Tous droits réservés.</p>
          <p className="flex items-center gap-2">
            Construit à <span className="font-semibold text-nexus-orange-400">Bangui</span> — déployé partout dans le monde
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { whatsappLink } from "@/lib/utils";
import { NEXUS_CONTACT } from "@/lib/contact";

interface ContactFormState {
  nom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
  /** Honeypot anti-bot — doit rester vide */
  website: string;
}

const INITIAL_FORM: ContactFormState = {
  nom: "",
  email: "",
  telephone: "",
  sujet: "",
  message: "",
  website: "",
};

const CHANNELS = [
  {
    icon: MessageCircle,
    eyebrow: "Réponse rapide",
    title: "WhatsApp",
    description: "Pour une question urgente — réponse dans la journée.",
    cta: "Écrire sur WhatsApp",
    href: whatsappLink("Bonjour Nexus RCA, j'aimerais poser une question."),
    external: true,
    accent: "orange" as const,
  },
  {
    icon: Phone,
    eyebrow: "Bangui",
    title: "+236 73 26 96 92",
    description: "Lundi à samedi — heures de bureau.",
    cta: "Appeler maintenant",
    href: `tel:+${NEXUS_CONTACT.phoneRcaRaw}`,
    external: false,
    accent: "navy" as const,
  },
  {
    icon: Mail,
    eyebrow: "Écrire",
    title: NEXUS_CONTACT.email,
    description: "Pour un dossier détaillé ou des pièces jointes.",
    cta: "Envoyer un e-mail",
    href: `mailto:${NEXUS_CONTACT.email}`,
    external: false,
    accent: "navy" as const,
  },
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<{ reference: string } | null>(null);
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        reference?: string;
        error?: string;
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Envoi impossible");
      }
      toast.success("Message envoyé !");
      setSent({ reference: json.reference || "—" });
      setForm(INITIAL_FORM);
    } catch (err) {
      console.error("[contact] submit:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur. Réessayez ou contactez-nous sur WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        {/* ─── Hero Premium ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-36 pb-20 text-white sm:pt-40">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-nexus-orange-500/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-nexus-blue-700/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="max-w-2xl">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                Contact
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
                Parlons de votre projet.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Une question, un visa à préparer, un voyage à coordonner ou un
                financement à structurer — un conseiller Nexus RCA vous répond
                sous 24 à 48 h ouvrées.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                  Données chiffrées
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-nexus-orange-300" />
                  Réponse 24-48 h ouvrées
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-nexus-orange-300" />
                  Bureau Bangui
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3 canaux ─────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {CHANNELS.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.title}
                    href={c.href}
                    target={c.external ? "_blank" : undefined}
                    rel={c.external ? "noreferrer" : undefined}
                    className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-nexus-orange-300/70"
                  >
                    <div
                      className={
                        c.accent === "orange"
                          ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm"
                          : "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 text-white shadow-sm"
                      }
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
                      {c.eyebrow}
                    </p>
                    <p className="mt-1 font-display text-base font-bold text-nexus-blue-950">
                      {c.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {c.description}
                    </p>
                    <p className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-nexus-orange-600 transition-transform group-hover:translate-x-0.5">
                      {c.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Formulaire + coordonnées ─────────────────────────────── */}
        <section className="bg-slate-50 pb-20 pt-4">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Coordonnées (5/12) */}
              <aside className="lg:col-span-5">
                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 text-white shadow-sm">
                  <div className="relative p-8">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-nexus-orange-500/10 blur-3xl"
                    />
                    <div className="relative">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-300">
                        Coordonnées
                      </span>
                      <h2 className="mt-3 font-display text-xl font-bold sm:text-2xl">
                        Toutes les façons de nous joindre.
                      </h2>

                      <ul className="mt-7 space-y-5 text-sm">
                        <CoordRow icon={MapPin} label="Adresse">
                          <p className="text-white">
                            {NEXUS_CONTACT.addressLine1}
                            <br />
                            {NEXUS_CONTACT.addressLine2}
                          </p>
                          <p className="mt-1 text-[11px] italic text-slate-400">
                            {NEXUS_CONTACT.appointmentOnly}
                          </p>
                        </CoordRow>

                        <CoordRow icon={Phone} label="RCA (principale)">
                          <a
                            href={`tel:+${NEXUS_CONTACT.phoneRcaRaw}`}
                            className="text-white transition-colors hover:text-nexus-orange-300"
                          >
                            {NEXUS_CONTACT.phoneRca}
                          </a>
                        </CoordRow>

                        <CoordRow icon={Phone} label="Canada (international)">
                          <a
                            href={`tel:+${NEXUS_CONTACT.phoneCanadaRaw}`}
                            className="text-white transition-colors hover:text-nexus-orange-300"
                          >
                            {NEXUS_CONTACT.phoneCanada}
                          </a>
                        </CoordRow>

                        <CoordRow icon={Mail} label="Email">
                          <a
                            href={`mailto:${NEXUS_CONTACT.email}`}
                            className="text-white transition-colors hover:text-nexus-orange-300"
                          >
                            {NEXUS_CONTACT.email}
                          </a>
                        </CoordRow>

                        <CoordRow icon={Globe} label="Site web">
                          <a
                            href={NEXUS_CONTACT.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white transition-colors hover:text-nexus-orange-300"
                          >
                            {NEXUS_CONTACT.website}
                          </a>
                        </CoordRow>

                        <CoordRow icon={Clock} label="Horaires">
                          <p className="text-white">
                            Lundi-vendredi : 8 h - 18 h
                            <br />
                            Samedi : 9 h - 14 h
                          </p>
                        </CoordRow>
                      </ul>
                    </div>
                  </div>

                  {/* Mini-carte intégrée */}
                  <div className="relative h-56 w-full overflow-hidden border-t border-white/10">
                    <iframe
                      title="Localisation Nexus RCA — Bangui"
                      src="https://www.google.com/maps?q=H%C3%B4pital+G%C3%A9n%C3%A9ral+Bangui+Centrafrique&z=14&output=embed"
                      className="absolute inset-0 h-full w-full grayscale-[15%]"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <a
                      href="https://www.google.com/maps?q=H%C3%B4pital+G%C3%A9n%C3%A9ral+Bangui+Centrafrique"
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-nexus-blue-950 shadow-md backdrop-blur transition-colors hover:bg-white"
                    >
                      Itinéraire
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </aside>

              {/* Formulaire (7/12) */}
              <div className="lg:col-span-7">
                {sent ? (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold text-emerald-900">
                      Message bien reçu
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-800">
                      Un accusé de réception vous a été envoyé par email. Un
                      conseiller Nexus revient vers vous sous 24 à 48 h ouvrées.
                    </p>
                    <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-mono text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                      Référence : {sent.reference}
                    </p>
                    <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setSent(null)}
                        className="text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline"
                      >
                        Envoyer un autre message
                      </button>
                      <span className="hidden text-emerald-300 sm:inline">·</span>
                      <a
                        href={whatsappLink(
                          `Bonjour Nexus, je viens de vous envoyer un message (réf. ${sent.reference}).`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Continuer sur WhatsApp
                      </a>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"
                  >
                    <div className="mb-7">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
                        Formulaire
                      </span>
                      <h2 className="mt-3 font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl">
                        Envoyez-nous un message
                      </h2>
                      <p className="mt-1.5 text-sm text-slate-600">
                        Renseignez vos coordonnées — un conseiller revient vers
                        vous rapidement.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Nom complet *"
                        name="nom"
                        required
                        autoComplete="name"
                        placeholder="Votre nom"
                        value={form.nom}
                        onChange={(e) =>
                          setForm({ ...form, nom: e.target.value })
                        }
                      />
                      <Input
                        label="E-mail *"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="vous@exemple.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                      <Input
                        label="Téléphone (optionnel)"
                        name="telephone"
                        autoComplete="tel"
                        placeholder="+236 …"
                        value={form.telephone}
                        onChange={(e) =>
                          setForm({ ...form, telephone: e.target.value })
                        }
                      />
                      <Input
                        label="Sujet *"
                        name="sujet"
                        required
                        placeholder="Objet de votre message"
                        value={form.sujet}
                        onChange={(e) =>
                          setForm({ ...form, sujet: e.target.value })
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <Textarea
                        label="Message *"
                        name="message"
                        required
                        rows={6}
                        placeholder="Décrivez brièvement votre besoin (visa, voyage, financement, etc.)"
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                      />
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        {form.message.length} / 5000 caractères
                      </p>
                    </div>

                    {/* Honeypot anti-bot — caché aux humains */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) =>
                        setForm({ ...form, website: e.target.value })
                      }
                      style={{
                        position: "absolute",
                        left: "-9999px",
                        opacity: 0,
                        pointerEvents: "none",
                      }}
                      aria-hidden="true"
                    />

                    <div className="mt-7 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-600" />
                        Vos données restent strictement confidentielles.
                      </p>
                      <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                        className="sm:w-auto"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Envoi en cours…
                          </>
                        ) : (
                          <>
                            Envoyer le message
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

// ─── Sous-composant ────────────────────────────────────────────────────────
function CoordRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-nexus-orange-300 backdrop-blur">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </li>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
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
import { PublicHero } from "@/components/PublicHero";
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

// CHANNELS sont construits dynamiquement dans le composant pour utiliser les
// traductions next-intl.

// ─── Pattern dot grid subtil pour le hero (style Stripe) ────────────────────
const DOT_GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export default function ContactPage() {
  const t = useTranslations("Contact");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<{ reference: string } | null>(null);
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);

  const CHANNELS = [
    {
      icon: MessageCircle,
      eyebrow: t("channel_whatsapp_eyebrow"),
      title: t("channel_whatsapp_title"),
      description: t("channel_whatsapp_description"),
      cta: t("channel_whatsapp_cta"),
      href: whatsappLink("Bonjour Nexus RCA, j'aimerais poser une question."),
      external: true,
      accent: "orange" as const,
    },
    {
      icon: Phone,
      eyebrow: t("channel_phone_eyebrow"),
      title: NEXUS_CONTACT.phoneRca,
      description: t("channel_phone_description"),
      cta: t("channel_phone_cta"),
      href: `tel:+${NEXUS_CONTACT.phoneRcaRaw}`,
      external: false,
      accent: "navy" as const,
    },
    {
      icon: Mail,
      eyebrow: t("channel_email_eyebrow"),
      title: NEXUS_CONTACT.email,
      description: t("channel_email_description"),
      cta: t("channel_email_cta"),
      href: `mailto:${NEXUS_CONTACT.email}`,
      external: false,
      accent: "navy" as const,
    },
  ];

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
      toast.success(t("toast_success"));
      setSent({ reference: json.reference || "—" });
      setForm(INITIAL_FORM);
    } catch (err) {
      console.error("[contact] submit:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : t("form_error_default")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        {/* ─── Hero Premium tech ────────────────────────────────────── */}
        <PublicHero
          eyebrow={t("hero_eyebrow")}
          titleStart={t("hero_title_start")}
          accentWord={t("hero_title_accent")}
          titleEnd={t("hero_title_end")}
          subtitle={t("hero_subtitle")}
        />

        {/* ─── 3 canaux Premium tech ────────────────────────────────── */}
        <section className="bg-slate-50 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-3">
              {CHANNELS.map((c) => {
                const Icon = c.icon;
                const isOrange = c.accent === "orange";
                return (
                  <a
                    key={c.title}
                    href={c.href}
                    target={c.external ? "_blank" : undefined}
                    rel={c.external ? "noreferrer" : undefined}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_18px_40px_-18px_rgba(255,102,0,0.22)]"
                  >
                    {/* Glow orange qui apparait au hover */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />

                    <div className="relative">
                      <div
                        className={
                          (isOrange
                            ? "from-nexus-orange-500 to-nexus-orange-700"
                            : "from-nexus-blue-900 to-nexus-blue-950") +
                          " flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105"
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
                        {c.eyebrow}
                      </p>
                      <p className="mt-1 font-display text-base font-bold text-nexus-blue-950">
                        {c.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {c.description}
                      </p>
                      <p className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-nexus-orange-600">
                        {c.cta}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Formulaire + coordonnées Premium tech ────────────────── */}
        <section className="bg-slate-50 pb-20 pt-4">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Coordonnées (5/12) — glassmorphism navy */}
              <aside className="lg:col-span-5">
                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 text-white shadow-[0_20px_60px_-25px_rgba(12,28,64,0.45)] lg:sticky lg:top-24">
                  {/* Dot grid + glows */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.4]"
                    style={DOT_GRID_STYLE}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/15 blur-3xl"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-nexus-blue-500/15 blur-3xl"
                  />

                  <div className="relative p-7 sm:p-8">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                      {t("coords_eyebrow")}
                    </span>
                    <h2 className="mt-3 font-display text-xl font-bold leading-tight sm:text-2xl">
                      {t("coords_title")}
                    </h2>

                    <ul className="mt-7 space-y-1.5 text-sm">
                      <CoordRow icon={MapPin} label={t("coords_address_label")}>
                        <p className="text-white">
                          {NEXUS_CONTACT.addressLine1}
                          <br />
                          {NEXUS_CONTACT.addressLine2}
                        </p>
                        <p className="mt-1 text-[11px] italic text-slate-400">
                          {NEXUS_CONTACT.appointmentOnly}
                        </p>
                      </CoordRow>

                      <CoordRow icon={Phone} label={t("coords_phone_rca_label")}>
                        <a
                          href={`tel:+${NEXUS_CONTACT.phoneRcaRaw}`}
                          className="text-white transition-colors duration-200 hover:text-nexus-orange-300"
                        >
                          {NEXUS_CONTACT.phoneRca}
                        </a>
                      </CoordRow>

                      <CoordRow icon={Phone} label={t("coords_phone_canada_label")}>
                        <a
                          href={`tel:+${NEXUS_CONTACT.phoneCanadaRaw}`}
                          className="text-white transition-colors duration-200 hover:text-nexus-orange-300"
                        >
                          {NEXUS_CONTACT.phoneCanada}
                        </a>
                      </CoordRow>

                      <CoordRow icon={Mail} label={t("coords_email_label")}>
                        <a
                          href={`mailto:${NEXUS_CONTACT.email}`}
                          className="text-white transition-colors duration-200 hover:text-nexus-orange-300"
                        >
                          {NEXUS_CONTACT.email}
                        </a>
                      </CoordRow>

                      <CoordRow icon={Globe} label={t("coords_website_label")}>
                        <a
                          href={NEXUS_CONTACT.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white transition-colors duration-200 hover:text-nexus-orange-300"
                        >
                          {NEXUS_CONTACT.website}
                        </a>
                      </CoordRow>

                      <CoordRow icon={Clock} label={t("coords_hours_label")}>
                        <p className="whitespace-pre-line text-white">
                          {t("coords_hours_value")}
                        </p>
                      </CoordRow>
                    </ul>
                  </div>

                  {/* Mini-carte avec ring */}
                  <div className="relative h-56 w-full overflow-hidden border-t border-white/10">
                    <iframe
                      title="Localisation Nexus RCA — Bangui"
                      src="https://www.google.com/maps?q=H%C3%B4pital+G%C3%A9n%C3%A9ral+Bangui+Centrafrique&z=14&output=embed"
                      className="absolute inset-0 h-full w-full grayscale-[20%] transition-all duration-500 hover:grayscale-0"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <a
                      href="https://www.google.com/maps?q=H%C3%B4pital+G%C3%A9n%C3%A9ral+Bangui+Centrafrique"
                      target="_blank"
                      rel="noreferrer"
                      className="group absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-bold text-nexus-blue-950 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)] backdrop-blur transition-all duration-300 hover:bg-white hover:shadow-[0_12px_32px_-8px_rgba(255,102,0,0.4)]"
                    >
                      {t("map_itineraire")}
                      <ExternalLink className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              </aside>

              {/* Formulaire (7/12) Premium tech */}
              <div className="lg:col-span-7">
                {sent ? (
                  <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-10 text-center shadow-[0_20px_50px_-20px_rgba(16,185,129,0.25)]">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl"
                    />
                    <div className="relative">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_12px_32px_-8px_rgba(16,185,129,0.4)]">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h3 className="mt-6 font-display text-2xl font-bold text-emerald-900">
                        {t("form_success_title")}
                      </h3>
                      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-emerald-800">
                        {t("form_success_subtitle")}
                      </p>
                      <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 font-mono text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                        {t("form_success_reference")}&nbsp;: {sent.reference}
                      </p>
                      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                        <button
                          type="button"
                          onClick={() => setSent(null)}
                          className="text-sm font-bold text-emerald-700 underline-offset-4 transition-colors hover:underline"
                        >
                          {t("form_success_send_another")}
                        </button>
                        <span className="hidden text-emerald-300 sm:inline">·</span>
                        <a
                          href={whatsappLink(
                            `Bonjour Nexus, je viens de vous envoyer un message (réf. ${sent.reference}).`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 underline-offset-4 transition-colors hover:underline"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {t("form_success_continue_whatsapp")}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="group/form relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_60px_-25px_rgba(12,28,64,0.18)] transition-all duration-500 hover:border-slate-300 hover:shadow-[0_24px_70px_-25px_rgba(255,102,0,0.18)] sm:p-9"
                  >
                    {/* Subtle orange glow corner accent */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover/form:bg-nexus-orange-500/8"
                    />

                    <div className="relative">
                      <div className="mb-7 flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                            {t("form_eyebrow")}
                          </span>
                          <h2 className="mt-3 font-display text-xl font-bold leading-tight text-nexus-blue-950 sm:text-2xl">
                            {t("form_title")}
                          </h2>
                          <p className="mt-1.5 text-sm text-slate-600">
                            {t("form_subtitle")}
                          </p>
                        </div>
                        {/* Indicator chip discret */}
                        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:inline-flex">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {t("form_chip_secured")}
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label={t("form_label_name")}
                          name="nom"
                          required
                          autoComplete="name"
                          placeholder={t("form_placeholder_name")}
                          value={form.nom}
                          onChange={(e) =>
                            setForm({ ...form, nom: e.target.value })
                          }
                        />
                        <Input
                          label={t("form_label_email")}
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder={t("form_placeholder_email")}
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                        />
                        <Input
                          label={t("form_label_phone")}
                          name="telephone"
                          autoComplete="tel"
                          placeholder={t("form_placeholder_phone")}
                          value={form.telephone}
                          onChange={(e) =>
                            setForm({ ...form, telephone: e.target.value })
                          }
                        />
                        <Input
                          label={t("form_label_subject")}
                          name="sujet"
                          required
                          placeholder={t("form_placeholder_subject")}
                          value={form.sujet}
                          onChange={(e) =>
                            setForm({ ...form, sujet: e.target.value })
                          }
                        />
                      </div>

                      <div className="mt-4">
                        <Textarea
                          label={t("form_label_message")}
                          name="message"
                          required
                          rows={6}
                          placeholder={t("form_placeholder_message")}
                          value={form.message}
                          onChange={(e) =>
                            setForm({ ...form, message: e.target.value })
                          }
                        />
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{t("form_chars_hint")}</span>
                          <span
                            className={
                              form.message.length > 4500
                                ? "font-bold text-rose-500"
                                : ""
                            }
                          >
                            {form.message.length} / 5000
                          </span>
                        </div>
                      </div>

                      {/* Honeypot anti-bot */}
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

                      <div className="mt-7 flex flex-col-reverse items-stretch gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-600" />
                          {t("form_confidential")}
                        </p>
                        <Button
                          type="submit"
                          disabled={loading}
                          size="lg"
                          className="group/btn relative overflow-hidden shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)] sm:w-auto"
                        >
                          {/* Shimmer subtle au hover */}
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                          />
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t("form_submitting")}
                            </>
                          ) : (
                            <>
                              {t("form_submit")}
                              <Send className="h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5" />
                            </>
                          )}
                        </Button>
                      </div>
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

// ─── Sous-composant : ligne coordonnées avec hover subtle highlight ──────
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
    <li className="group/row -mx-2 flex gap-4 rounded-2xl px-2 py-2.5 transition-colors duration-200 hover:bg-white/5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-nexus-orange-300 backdrop-blur-md transition-all duration-300 group-hover/row:bg-white/15 group-hover/row:text-nexus-orange-200">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </li>
  );
}

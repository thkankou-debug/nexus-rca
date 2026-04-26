"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { whatsappLink } from "@/lib/utils";
import { NEXUS_CONTACT } from "@/lib/contact";

export default function ContactPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    sujet: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("contacts").insert(form);
      if (error) throw error;
      toast.success("Message envoyé !");
      setSent(true);
      setForm({ nom: "", email: "", telephone: "", sujet: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Erreur. Réessayez ou contactez-nous sur WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                <MessageCircle className="h-4 w-4 text-nexus-orange-400" />
                Parlons de votre projet
              </div>
              <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl">
                Contactez <span className="text-gradient-orange">Nexus RCA</span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/75">
                Agence basée à Bangui, au service des projets qui traversent les frontières. Choisissez le canal qui vous convient — nous vous répondons vite.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="bg-gradient-to-b from-white to-nexus-blue-50 py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-5">
              {/* Info sidebar */}
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-3xl bg-nexus-blue-950 p-8 text-white shadow-xl">
                  <h2 className="font-display text-2xl font-bold">
                    Nos coordonnées
                  </h2>
                  <p className="mt-2 text-white/70">
                    Disponibles du lundi au samedi.
                  </p>

                  <div className="mt-6 space-y-5">
                    {/* Adresse */}
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexus-orange-500/20">
                        <MapPin className="h-5 w-5 text-nexus-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                          Adresse
                        </p>
                        <p className="mt-0.5 text-white">
                          {NEXUS_CONTACT.addressLine1}
                          <br />
                          {NEXUS_CONTACT.addressLine2}
                        </p>
                        <p className="mt-1 text-xs italic text-white/60">
                          {NEXUS_CONTACT.appointmentOnly}
                        </p>
                      </div>
                    </div>

                    {/* Telephone RCA principal */}
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexus-orange-500/20">
                        <Phone className="h-5 w-5 text-nexus-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                          RCA (principale)
                        </p>
                        <a
                          href={`tel:+${NEXUS_CONTACT.phoneRcaRaw}`}
                          className="mt-0.5 block text-white hover:text-nexus-orange-400"
                        >
                          {NEXUS_CONTACT.phoneRca}
                        </a>
                      </div>
                    </div>

                    {/* Telephone international Canada */}
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexus-blue-500/20">
                        <Phone className="h-5 w-5 text-nexus-blue-300" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                          International (Canada)
                        </p>
                        <a
                          href={`tel:+${NEXUS_CONTACT.phoneCanadaRaw}`}
                          className="mt-0.5 block text-white hover:text-nexus-orange-400"
                        >
                          {NEXUS_CONTACT.phoneCanada}
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexus-orange-500/20">
                        <Mail className="h-5 w-5 text-nexus-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                          Email
                        </p>
                        <a
                          href={`mailto:${NEXUS_CONTACT.email}`}
                          className="mt-0.5 block text-white hover:text-nexus-orange-400"
                        >
                          {NEXUS_CONTACT.email}
                        </a>
                      </div>
                    </div>

                    {/* Site web */}
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexus-orange-500/20">
                        <Globe className="h-5 w-5 text-nexus-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                          Site web
                        </p>
                        <a
                          href={NEXUS_CONTACT.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 block text-white hover:text-nexus-orange-400"
                        >
                          {NEXUS_CONTACT.website}
                        </a>
                      </div>
                    </div>

                    {/* Horaires */}
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexus-orange-500/20">
                        <Clock className="h-5 w-5 text-nexus-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                          Horaires
                        </p>
                        <p className="mt-0.5 text-white">
                          Lun-Ven : 8h - 18h
                          <br />
                          Samedi : 9h - 14h
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bouton WhatsApp discret */}
                  <div className="mt-8 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-white/80">
                      Pour une réponse rapide, écrivez-nous sur WhatsApp.
                    </p>
                    <a
                      href={whatsappLink(
                        "Bonjour Nexus RCA, j'aimerais poser une question."
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Écrire sur WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-3">
                {sent ? (
                  <div className="rounded-3xl border border-green-200 bg-green-50 p-10 text-center">
                    <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
                    <h3 className="mt-4 font-display text-2xl font-bold text-green-900">
                      Message envoyé !
                    </h3>
                    <p className="mt-2 text-green-800">
                      Merci pour votre message. Nous vous recontactons très bientôt.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-6 text-sm font-semibold text-green-700 underline"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card sm:p-10"
                  >
                    <h2 className="font-display text-2xl font-bold text-nexus-blue-950">
                      Envoyez-nous un message
                    </h2>
                    <p className="mt-1 text-slate-600">
                      Nous vous répondons dans la journée.
                    </p>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <Input
                        label="Nom complet *"
                        name="nom"
                        required
                        placeholder="Votre nom"
                        value={form.nom}
                        onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      />
                      <Input
                        label="Email *"
                        name="email"
                        type="email"
                        required
                        placeholder="vous@exemple.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                      <Input
                        label="Téléphone"
                        name="telephone"
                        placeholder="+236 ..."
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
                        onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                      />
                    </div>

                    <div className="mt-5">
                      <Textarea
                        label="Message *"
                        name="message"
                        required
                        rows={6}
                        placeholder="Votre message..."
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="mt-6 w-full sm:w-auto"
                    >
                      {loading ? "Envoi..." : "Envoyer le message"}
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="bg-nexus-blue-50 pb-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <iframe
                title="Localisation Nexus RCA Bangui"
                src="https://www.google.com/maps?q=Bangui+Centrafrique+Hopital+General&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

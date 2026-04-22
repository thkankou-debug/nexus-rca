"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, Send, Loader2 } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SERVICES } from "@/lib/services";
import { createClient } from "@/lib/supabase/client";

const PAYS = [
  "Centrafrique",
  "Cameroun",
  "Tchad",
  "Congo",
  "RDC",
  "Gabon",
  "Sénégal",
  "Côte d'Ivoire",
  "France",
  "Canada",
  "Autre",
];

export function DemandeForm() {
  const searchParams = useSearchParams();
  const presetService = searchParams.get("service");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    nom_complet: "",
    email: "",
    telephone: "",
    pays: "Centrafrique",
    service: presetService ? SERVICES.find((s) => s.slug === presetService)?.title || "" : "",
    description: "",
    urgence: "normale" as "faible" | "normale" | "elevee" | "critique",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nom_complet.trim()) e.nom_complet = "Le nom est requis";
    if (!form.email.trim()) e.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email invalide";
    if (!form.telephone.trim()) e.telephone = "Le téléphone est requis";
    if (!form.service) e.service = "Choisissez un service";
    if (!form.description.trim() || form.description.length < 20)
      e.description = "Décrivez votre besoin (minimum 20 caractères)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("demandes").insert({
        client_id: user?.id ?? null,
        nom_complet: form.nom_complet,
        email: form.email,
        telephone: form.telephone,
        pays: form.pays,
        service: form.service,
        description: form.description,
        urgence: form.urgence,
        statut: "nouveau",
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Votre demande a été envoyée avec succès !");
      setForm({
        nom_complet: "",
        email: "",
        telephone: "",
        pays: "Centrafrique",
        service: "",
        description: "",
        urgence: "normale",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Une erreur s'est produite. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-10 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h3 className="font-display text-3xl font-bold text-nexus-blue-950">
          Demande reçue !
        </h3>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Merci pour votre confiance. Un conseiller Nexus vous contactera sous 24 heures au numéro
          que vous avez fourni.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={() => setSuccess(false)} variant="secondary">
            Nouvelle demande
          </Button>
          <Button href="/" variant="ghost">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10"
    >
      <div className="mb-6 grid gap-5 sm:grid-cols-2">
        <Input
          label="Nom complet *"
          name="nom_complet"
          value={form.nom_complet}
          onChange={handleChange}
          error={errors.nom_complet}
          placeholder="Ex : Jean-Paul Mbongo"
        />
        <Input
          label="Email *"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="vous@example.com"
        />
      </div>

      <div className="mb-6 grid gap-5 sm:grid-cols-2">
        <Input
          label="Téléphone / WhatsApp *"
          name="telephone"
          type="tel"
          value={form.telephone}
          onChange={handleChange}
          error={errors.telephone}
          placeholder="+236 XX XX XX XX"
        />
        <Select
          label="Pays de résidence"
          name="pays"
          value={form.pays}
          onChange={handleChange}
        >
          {PAYS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-6 grid gap-5 sm:grid-cols-2">
        <Select
          label="Type de service *"
          name="service"
          value={form.service}
          onChange={handleChange}
          error={errors.service}
        >
          <option value="">-- Choisir un service --</option>
          {SERVICES.map((s) => (
            <option key={s.id} value={s.title}>
              {s.title}
            </option>
          ))}
        </Select>
        <Select
          label="Niveau d'urgence"
          name="urgence"
          value={form.urgence}
          onChange={handleChange}
        >
          <option value="faible">Faible (pas pressé)</option>
          <option value="normale">Normale (quelques semaines)</option>
          <option value="elevee">Élevée (quelques jours)</option>
          <option value="critique">Critique (urgent)</option>
        </Select>
      </div>

      <div className="mb-8">
        <Textarea
          label="Décrivez votre besoin *"
          name="description"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Donnez un maximum de détails : contexte, objectifs, dates, contraintes..."
          rows={6}
          hint={`${form.description.length} caractères`}
        />
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
        <p className="text-xs text-slate-500">
          En envoyant ce formulaire, vous acceptez d'être contacté par Nexus RCA.
        </p>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Envoi...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Envoyer ma demande
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

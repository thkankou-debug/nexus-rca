"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ClipboardCheck,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { createClient } from "@/lib/supabase/client";

const VALUE_PROPS = [
  {
    icon: Sparkles,
    title: "Démarrez en quelques minutes",
    description:
      "Création de compte instantanée — recevez votre premier bilan de faisabilité écrit sous 72 heures ouvrées.",
  },
  {
    icon: ClipboardCheck,
    title: "Méthodologie claire et écrite",
    description:
      "Étude initiale gratuite, devis fixe avant tout engagement. Aucune surprise.",
  },
  {
    icon: ShieldCheck,
    title: "Confidentialité et conformité",
    description:
      "Données chiffrées, accès strictement contrôlé. Bureau enregistré à Bangui.",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirm: "",
    telephone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nom: form.nom,
          prenom: form.prenom,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.user && form.telephone) {
      await supabase
        .from("profiles")
        .update({ telephone: form.telephone })
        .eq("id", data.user.id);
    }

    toast.success(
      "Compte créé. Vérifiez votre e-mail si la confirmation est activée."
    );

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      router.push("/login");
    }
  };

  return (
    <AuthLayout
      leftEyebrow="Rejoindre Nexus RCA"
      leftTitle="Pilotez vos démarches en toute sérénité."
      leftDescription="Un espace unique pour suivre vos visas, voyages et paiements — accompagné par un conseiller dédié à Bangui."
      valueProps={VALUE_PROPS}
      formEyebrow="Inscription"
      formTitle="Créer votre compte"
      formSubtitle="Quelques informations suffisent. Vous serez accompagné dès la première étape."
      footerLink={{
        label: "Déjà inscrit ?",
        href: "/login",
        cta: "Se connecter",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Prénom"
            name="prenom"
            required
            autoComplete="given-name"
            value={form.prenom}
            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
          />
          <Input
            label="Nom"
            name="nom"
            required
            autoComplete="family-name"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
        </div>

        <Input
          label="E-mail"
          name="email"
          type="email"
          required
          placeholder="vous@exemple.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <Input
          label="Téléphone"
          name="telephone"
          placeholder="+236 …"
          autoComplete="tel"
          value={form.telephone}
          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Mot de passe"
            name="password"
            type="password"
            required
            placeholder="Min. 8 caractères"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Input
            label="Confirmer"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="group/btn relative mt-2 w-full overflow-hidden shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
          size="lg"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
          />
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création en cours…
            </>
          ) : (
            <>
              Créer mon compte
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

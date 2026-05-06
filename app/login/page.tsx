"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ClipboardCheck,
  Loader2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { createClient } from "@/lib/supabase/client";

const VALUE_PROPS = [
  {
    icon: ClipboardCheck,
    title: "Suivi structuré de vos dossiers",
    description:
      "Visa, voyages, transferts, paiements — tout est consultable depuis un espace unique.",
  },
  {
    icon: UserCheck,
    title: "Un interlocuteur Nexus dédié",
    description:
      "Le même conseiller suit vos demandes du premier contact à la décision finale.",
  },
  {
    icon: ShieldCheck,
    title: "Confidentialité par défaut",
    description:
      "Vos pièces et échanges sont chiffrés. Accès strictement limité au staff Nexus.",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const supabase = createClient();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Identifiants incorrects");
      return;
    }
    toast.success("Connexion réussie");
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        label="Mot de passe"
        name="password"
        type="password"
        required
        placeholder="••••••••"
        autoComplete="current-password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

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
            Connexion en cours…
          </>
        ) : (
          <>
            Se connecter
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout
      leftEyebrow="Espace Nexus RCA"
      leftTitle="Reprenez la main sur vos démarches."
      leftDescription="Accédez à vos dossiers visa, voyages et paiements depuis votre espace personnel — accompagné par votre conseiller Nexus."
      valueProps={VALUE_PROPS}
      formEyebrow="Connexion"
      formTitle="Accédez à votre espace"
      formSubtitle="Saisissez vos identifiants pour continuer."
      footerLink={{
        label: "Pas encore de compte ?",
        href: "/register",
        cta: "Créer un compte",
      }}
    >
      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/60">
            <Loader2 className="h-6 w-6 animate-spin text-nexus-orange-500" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

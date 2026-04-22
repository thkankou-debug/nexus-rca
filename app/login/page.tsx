"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

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
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur sm:p-10"
    >
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
          Bon retour 👋
        </h1>
        <p className="mt-2 text-slate-600">
          Connectez-vous pour accéder à votre espace.
        </p>
      </div>

      <div className="space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="vous@exemple.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Mot de passe"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Connexion...
          </>
        ) : (
          <>
            Se connecter
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>

      <p className="mt-6 text-center text-sm text-slate-600">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-semibold text-nexus-orange-600 hover:text-nexus-orange-700"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-nexus-blue-950">
      <div className="absolute inset-0 bg-mesh-gradient opacity-60" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-nexus-blue-500/20 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Logo variant="light" />
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="flex h-80 items-center justify-center rounded-3xl bg-white/90">
                <Loader2 className="h-8 w-8 animate-spin text-nexus-orange-500" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-white/60">
            <Link href="/" className="hover:text-white">
              ← Retour au site
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

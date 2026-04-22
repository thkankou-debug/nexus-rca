"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

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

    // Mise à jour du téléphone sur le profil auto-créé par le trigger
    if (data.user && form.telephone) {
      await supabase
        .from("profiles")
        .update({ telephone: form.telephone })
        .eq("id", data.user.id);
    }

    toast.success(
      "Compte créé ! Vérifiez votre email si la confirmation est activée."
    );

    // Si email confirmation désactivé dans Supabase, l'utilisateur est déjà connecté
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      router.push("/login");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-nexus-blue-950">
      <div className="absolute inset-0 bg-mesh-gradient opacity-60" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-nexus-orange-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-nexus-blue-500/20 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Logo variant="light" />
            </Link>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur sm:p-10"
          >
            <div className="mb-8 text-center">
              <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
                Créer un compte
              </h1>
              <p className="mt-2 text-slate-600">
                Rejoignez Nexus RCA et pilotez vos demandes.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Prénom"
                name="prenom"
                required
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
              <Input
                label="Nom *"
                name="nom"
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </div>

            <div className="mt-4 space-y-4">
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
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Mot de passe *"
                  name="password"
                  type="password"
                  required
                  placeholder="Min. 8 caractères"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <Input
                  label="Confirmer *"
                  name="confirm"
                  type="password"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-6 w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>

            <p className="mt-6 text-center text-sm text-slate-600">
              Déjà inscrit ?{" "}
              <Link
                href="/login"
                className="font-semibold text-nexus-orange-600 hover:text-nexus-orange-700"
              >
                Se connecter
              </Link>
            </p>
          </form>

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

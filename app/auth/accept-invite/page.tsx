"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

type Status = "loading" | "ready" | "error" | "submitting" | "success";

export default function AcceptInvitePage() {
  const supabase = createClient();
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // RECUPERATION DU TOKEN ET AUTH
  // ============================================================
  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Cas 1 : token present dans le hash URL (#access_token=...)
        // C est le format standard d invitation Supabase
        const hash = window.location.hash;

        if (hash && hash.includes("access_token")) {
          // Supabase auto-process le hash quand on appelle getSession
          // Mais on peut aussi le faire manuellement
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          const type = params.get("type");

          if (!accessToken) {
            throw new Error("Token d'accès manquant dans l'URL");
          }

          if (type !== "invite" && type !== "magiclink" && type !== "recovery" && type !== "signup") {
            throw new Error(`Type de lien non supporté : ${type}`);
          }

          // Etablir la session avec les tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            throw new Error(error.message);
          }

          if (!data.user) {
            throw new Error("Session non établie");
          }

          setUserEmail(data.user.email || "");
          setUserId(data.user.id);
          setStatus("ready");

          // Nettoyer le hash de l URL pour eviter de re-traiter au refresh
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          );
          return;
        }

        // Cas 2 : code present dans les query params (?code=...)
        // Format moderne PKCE
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
          );

          if (error) {
            throw new Error(error.message);
          }

          if (!data.user) {
            throw new Error("Session non établie");
          }

          setUserEmail(data.user.email || "");
          setUserId(data.user.id);
          setStatus("ready");
          return;
        }

        // Cas 3 : deja connecte (refresh de la page)
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          setUserEmail(sessionData.session.user.email || "");
          setUserId(sessionData.session.user.id);
          setStatus("ready");
          return;
        }

        // Aucun token trouve
        throw new Error(
          "Lien d'invitation invalide ou expiré. Demande à un super-admin de te renvoyer une invitation."
        );
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Erreur inconnue";
        console.error("Erreur acceptation invitation :", error);
        setErrorMessage(msg);
        setStatus("error");
      }
    };

    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // SOUMISSION DU MOT DE PASSE
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setStatus("submitting");

    try {
      // Mettre a jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Verifier que le profil existe (au cas ou)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .single();

      if (!profileData) {
        // Ce cas ne devrait pas arriver car le profil est cree dans l API,
        // mais on gere defensivement
        toast.error(
          "Profil introuvable. Contactez un administrateur."
        );
        setStatus("error");
        setErrorMessage(
          "Votre profil n'est pas correctement configuré. Contactez un super-admin."
        );
        return;
      }

      setStatus("success");
      toast.success("Mot de passe défini avec succès");

      // Rediriger vers le dashboard apres 2s
      setTimeout(() => {
        const role = profileData.role;
        const dashboardPath =
          role === "super_admin"
            ? "/dashboard/super-admin"
            : role === "admin"
            ? "/dashboard/admin"
            : role === "agent"
            ? "/dashboard/agent"
            : "/dashboard/client";
        router.push(dashboardPath);
        router.refresh();
      }, 2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      toast.error(msg);
      setStatus("ready");
    }
  };

  // ============================================================
  // RENDER : Chargement
  // ============================================================
  if (status === "loading") {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-nexus-orange-500" />
          <p className="mt-4 text-sm text-slate-600">
            Vérification de votre invitation...
          </p>
        </div>
      </Container>
    );
  }

  // ============================================================
  // RENDER : Erreur
  // ============================================================
  if (status === "error") {
    return (
      <Container>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-nexus-blue-950">
            Lien invalide ou expiré
          </h1>
          <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
          <div className="mt-6 space-y-2">
            <Link
              href="/connexion"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600"
            >
              Aller à la page de connexion
            </Link>
            <p className="text-xs text-slate-500">
              Si le problème persiste, contacte le super-admin pour une nouvelle invitation.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  // ============================================================
  // RENDER : Succes
  // ============================================================
  if (status === "success") {
    return (
      <Container>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-nexus-blue-950">
            Compte activé !
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Votre mot de passe a été défini. Redirection vers votre tableau de bord...
          </p>
          <Loader2 className="mx-auto mt-4 h-6 w-6 animate-spin text-nexus-orange-500" />
        </div>
      </Container>
    );
  }

  // ============================================================
  // RENDER : Formulaire (status: ready ou submitting)
  // ============================================================
  return (
    <Container>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-nexus-blue-950">
          Bienvenue dans l'équipe Nexus
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Crée ton mot de passe pour finaliser l'activation de ton compte.
        </p>
      </div>

      {/* Email de l utilisateur */}
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <Mail className="h-4 w-4 text-slate-500" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">Email de connexion</p>
          <p className="truncate text-sm font-semibold text-nexus-blue-950">
            {userEmail}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Nouveau mot de passe *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              placeholder="Minimum 8 caractères"
              disabled={status === "submitting"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Au moins 8 caractères. Mélange lettres, chiffres et symboles pour
            plus de sécurité.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Confirmer le mot de passe *
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
            placeholder="Retape ton mot de passe"
            disabled={status === "submitting"}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-red-600">
              Les mots de passe ne correspondent pas
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600 disabled:opacity-50"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Activation en cours...
            </>
          ) : (
            <>
              Activer mon compte
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        En activant ton compte, tu acceptes les conditions d'utilisation
        de Nexus RCA.
      </p>
    </Container>
  );
}

// ============================================================================
// CONTAINER COMMUN
// ============================================================================
function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-nexus-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

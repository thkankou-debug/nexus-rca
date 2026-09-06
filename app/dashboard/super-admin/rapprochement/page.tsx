import { Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  RapprochementFinancier,
  type FactureRapprochement,
  type SessionEcart,
  type CommissionParAgent,
} from "@/components/dashboard/RapprochementFinancier";

export const metadata = {
  title: "Rapprochement financier | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function RapprochementPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  // Factures payées avec au moins un échéancier — seul lien mécanique réel
  // (echeanciers.facture_id est une vraie FK, contrairement à factures ↔
  // payments qui n'a aucune colonne commune, voir docs/DETTE.md #14).
  const { data: facturesData, error: facturesError } = await supabase
    .from("factures")
    .select(
      "reference, amount, currency, status, demandes(nom_complet), echeanciers(amount, status)"
    )
    .eq("status", "payee");

  if (facturesError) console.error("[RAPPROCHEMENT] factures:", facturesError.message);

  type FactureRow = {
    reference: string | null;
    amount: number;
    currency: string;
    demandes: { nom_complet: string } | null;
    echeanciers: { amount: number; status: string }[];
  };

  const facturesAvecEcheancier: FactureRapprochement[] = ((facturesData as unknown as FactureRow[]) || [])
    .filter((f) => f.echeanciers.length > 0)
    .map((f) => {
      const total = f.echeanciers.reduce((sum, e) => sum + Number(e.amount), 0);
      const paye = f.echeanciers.filter((e) => e.status === "paye").reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        reference: f.reference,
        client: f.demandes?.nom_complet || "—",
        montant: Number(f.amount),
        currency: f.currency,
        echeance_total: total,
        echeance_payee: paye,
        a_echeancier: true,
      };
    });

  const anomalies = facturesAvecEcheancier.filter((f) => f.echeance_payee < f.montant - 0.01);

  // Sessions de caisse clôturées avec un écart non nul.
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("caisse_sessions")
    .select("closed_at, opening_balance, expected_balance, actual_balance, discrepancy, profiles(nom, prenom)")
    .eq("status", "cloturee")
    .neq("discrepancy", 0);

  if (sessionsError) console.error("[RAPPROCHEMENT] sessions:", sessionsError.message);

  type SessionRow = {
    closed_at: string;
    opening_balance: number;
    expected_balance: number;
    actual_balance: number;
    discrepancy: number;
    profiles: { nom: string; prenom: string | null } | null;
  };

  const sessionsAvecEcart: SessionEcart[] = ((sessionsData as unknown as SessionRow[]) || []).map((s) => ({
    agent: s.profiles ? `${s.profiles.prenom || ""} ${s.profiles.nom}`.trim() : "—",
    closed_at: s.closed_at,
    opening_balance: Number(s.opening_balance),
    expected_balance: Number(s.expected_balance),
    actual_balance: Number(s.actual_balance),
    discrepancy: Number(s.discrepancy),
  }));

  // Commissions dues vs payées, groupées par agent.
  const { data: commissionsData, error: commissionsError } = await supabase
    .from("commissions")
    .select("amount, status, profiles!commissions_agent_id_fkey(nom, prenom)");

  if (commissionsError) console.error("[RAPPROCHEMENT] commissions:", commissionsError.message);

  type CommissionRow = { amount: number; status: string; profiles: { nom: string; prenom: string | null } | null };

  const parAgent = new Map<string, CommissionParAgent>();
  for (const c of (commissionsData as unknown as CommissionRow[]) || []) {
    const nom = c.profiles ? `${c.profiles.prenom || ""} ${c.profiles.nom}`.trim() : "—";
    const entry = parAgent.get(nom) || { agent: nom, du: 0, paye: 0 };
    if (c.status === "payee") entry.paye += Number(c.amount);
    else entry.du += Number(c.amount);
    parAgent.set(nom, entry);
  }
  const commissionsParAgent = Array.from(parAgent.values());

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Scale className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Rapprochement financier</h1>
          <p className="mt-1 text-slate-600">Factures, échéanciers, caisse et commissions — ce qui est vérifiable aujourd&apos;hui.</p>
        </div>
      </div>

      <RapprochementFinancier
        facturesPayeesAvecEcheancier={facturesAvecEcheancier}
        anomalies={anomalies}
        sessionsAvecEcart={sessionsAvecEcart}
        commissionsParAgent={commissionsParAgent}
      />
    </DashboardShell>
  );
}

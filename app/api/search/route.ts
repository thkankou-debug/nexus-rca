import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export const dynamic = "force-dynamic";

const PER_CATEGORY_LIMIT = 5;
const MIN_QUERY_LENGTH = 2;

type RolePath = "agent" | "admin" | "super-admin";

function rolePath(role: UserRole): RolePath | null {
  if (role === "super_admin") return "super-admin";
  if (role === "admin") return "admin";
  if (role === "agent") return "agent";
  return null;
}

// Échappe les wildcards Postgres pour éviter les patterns inattendus.
function escapeIlike(q: string): string {
  return q.replace(/[\\%_]/g, (c) => `\\${c}`);
}

type ClientRow = {
  id: string;
  reference: string | null;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string | null;
};

type DemandeRow = {
  id: string;
  service: string;
  nom_complet: string | null;
  statut: string | null;
};

type AppointmentRow = {
  id: string;
  reference: string | null;
  service: string | null;
  statut: string | null;
};

type PaymentRow = {
  id: string;
  reference: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
};

type Hit = {
  id: string;
  title: string;
  subtitle: string | null;
  reference: string | null;
  url: string;
};

type SearchResponse = {
  clients: Hit[];
  demandes: Hit[];
  appointments: Hit[];
  payments: Hit[];
};

const EMPTY: SearchResponse = {
  clients: [],
  demandes: [],
  appointments: [],
  payments: [],
};

export async function GET(request: NextRequest) {
  console.log("===== [GLOBAL_SEARCH] START =====");

  try {
    const url = new URL(request.url);
    const rawQ = url.searchParams.get("q") || "";
    const q = rawQ.trim();

    if (q.length < MIN_QUERY_LENGTH) {
      return NextResponse.json(EMPTY);
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.warn("[GLOBAL_SEARCH] no user");
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();
    if (!profileRow) {
      console.warn("[GLOBAL_SEARCH] no profile for user", user.id);
      return NextResponse.json({ error: "Profil introuvable" }, { status: 401 });
    }

    const role = profileRow.role as UserRole;
    const rp = rolePath(role);
    if (!rp) {
      // Les utilisateurs avec rôle 'client' n'ont pas de DashboardShell ni accès recherche.
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const isAgent = role === "agent";
    const pattern = `%${escapeIlike(q)}%`;
    console.log(`[GLOBAL_SEARCH] role=${role} q=${JSON.stringify(q)}`);

    // ─── Clients : nom, prenom, raison_sociale, email, telephone ──────────
    // Pas de scope agent (table clients sans agent_id, l'agent voit tout).
    const clientsQuery = supabase
      .from("clients")
      .select("id, reference, nom, prenom, raison_sociale, email, telephone")
      .or(
        `nom.ilike.${pattern},prenom.ilike.${pattern},raison_sociale.ilike.${pattern},email.ilike.${pattern},telephone.ilike.${pattern}`
      )
      .limit(PER_CATEGORY_LIMIT);

    // ─── Demandes : service + nom_complet ────────────────────────────────
    let demandesQuery = supabase
      .from("demandes")
      .select("id, service, nom_complet, statut")
      .or(`service.ilike.${pattern},nom_complet.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(PER_CATEGORY_LIMIT);
    if (isAgent) demandesQuery = demandesQuery.eq("agent_id", profileRow.id);

    // ─── Appointments : reference + service ──────────────────────────────
    let appointmentsQuery = supabase
      .from("appointments")
      .select("id, reference, service, statut")
      .or(`reference.ilike.${pattern},service.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(PER_CATEGORY_LIMIT);
    if (isAgent) appointmentsQuery = appointmentsQuery.eq("agent_id", profileRow.id);

    // ─── Payments : reference uniquement ─────────────────────────────────
    let paymentsQuery = supabase
      .from("payments")
      .select("id, reference, amount, currency, status")
      .ilike("reference", pattern)
      .order("created_at", { ascending: false })
      .limit(PER_CATEGORY_LIMIT);
    if (isAgent) paymentsQuery = paymentsQuery.eq("created_by", profileRow.id);

    const [clientsRes, demandesRes, appointmentsRes, paymentsRes] =
      await Promise.all([
        clientsQuery,
        demandesQuery,
        appointmentsQuery,
        paymentsQuery,
      ]);

    if (clientsRes.error)
      console.error("[GLOBAL_SEARCH] clients error:", clientsRes.error.message);
    if (demandesRes.error)
      console.error("[GLOBAL_SEARCH] demandes error:", demandesRes.error.message);
    if (appointmentsRes.error)
      console.error(
        "[GLOBAL_SEARCH] appointments error:",
        appointmentsRes.error.message
      );
    if (paymentsRes.error)
      console.error("[GLOBAL_SEARCH] payments error:", paymentsRes.error.message);

    // L4 : fiche unique, accessible depuis tout role ayant une permission
    // client.read.* (agent sur ses propres clients, admin/super_admin sur
    // tous) — plus besoin de distinguer par role ici.
    const clientUrl = (id: string) => `/dashboard/clients/${id}`;
    const demandesListUrl = `/dashboard/${rp}/demandes`;
    const appointmentsListUrl = `/dashboard/${rp}/rdv`;
    const paymentsListUrl = `/dashboard/${rp}/paiements`;

    const clientHits: Hit[] = ((clientsRes.data || []) as ClientRow[]).map(
      (c) => ({
        id: c.id,
        title:
          c.raison_sociale ||
          [c.prenom, c.nom].filter(Boolean).join(" ") ||
          c.nom ||
          "—",
        subtitle:
          [c.email, c.telephone].filter(Boolean).join(" · ") || null,
        reference: c.reference,
        url: clientUrl(c.id),
      })
    );

    const demandeHits: Hit[] = ((demandesRes.data || []) as DemandeRow[]).map(
      (d) => ({
        id: d.id,
        title: d.nom_complet || d.service || "—",
        subtitle:
          [d.service, d.statut].filter(Boolean).join(" · ") || null,
        reference: null,
        url: demandesListUrl,
      })
    );

    const appointmentHits: Hit[] = (
      (appointmentsRes.data || []) as AppointmentRow[]
    ).map((a) => ({
      id: a.id,
      title: a.reference || a.service || "—",
      subtitle: [a.service, a.statut].filter(Boolean).join(" · ") || null,
      reference: a.reference,
      url: appointmentsListUrl,
    }));

    const paymentHits: Hit[] = ((paymentsRes.data || []) as PaymentRow[]).map(
      (p) => ({
        id: p.id,
        title: p.reference || "—",
        subtitle:
          p.amount != null
            ? `${p.amount} ${p.currency || ""} · ${p.status || ""}`.trim()
            : p.status || null,
        reference: p.reference,
        url: paymentsListUrl,
      })
    );

    const body: SearchResponse = {
      clients: clientHits,
      demandes: demandeHits,
      appointments: appointmentHits,
      payments: paymentHits,
    };

    console.log(
      `[GLOBAL_SEARCH] ✅ clients=${clientHits.length} demandes=${demandeHits.length} appointments=${appointmentHits.length} payments=${paymentHits.length}`
    );
    console.log("===== [GLOBAL_SEARCH] END =====");

    return NextResponse.json(body);
  } catch (err) {
    console.error("[GLOBAL_SEARCH] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

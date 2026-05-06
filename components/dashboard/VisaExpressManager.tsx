"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  User as UserIcon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface VisaExpressRow {
  id: string;
  reference: string;
  nom_complet: string;
  email: string;
  whatsapp: string;
  pays_destination: string;
  type_visa: string;
  urgence: "normal" | "urgent" | "critique";
  notes: string | null;
  document_paths: string[];
  status: "nouveau" | "en_cours" | "traite" | "annule";
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

interface DetailResponse extends VisaExpressRow {
  documents: { name: string; url: string }[];
}

// ─── Constantes UI premium ──────────────────────────────────────────────────
const URGENCE_META: Record<
  VisaExpressRow["urgence"],
  { label: string; className: string; dot: string }
> = {
  normal: {
    label: "Normal",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
    dot: "bg-emerald-500",
  },
  urgent: {
    label: "Urgent",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
    dot: "bg-amber-500",
  },
  critique: {
    label: "Critique",
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
    dot: "bg-rose-500",
  },
};

const STATUS_META: Record<
  VisaExpressRow["status"],
  { label: string; className: string }
> = {
  nouveau: {
    label: "Nouveau",
    className: "bg-slate-100 text-slate-700",
  },
  en_cours: {
    label: "En cours",
    className: "bg-blue-50 text-blue-700",
  },
  traite: {
    label: "Traité",
    className: "bg-emerald-50 text-emerald-700",
  },
  annule: {
    label: "Annulé",
    className: "bg-rose-50 text-rose-600",
  },
};

const ALL_STATUS: VisaExpressRow["status"][] = ["nouveau", "en_cours", "traite", "annule"];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  initialRows: VisaExpressRow[];
  /** true = lecture seule (rôle agent) */
  readOnly?: boolean;
}

export function VisaExpressManager({ initialRows, readOnly = false }: Props) {
  const [rows, setRows] = useState<VisaExpressRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [filterUrgence, setFilterUrgence] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterUrgence !== "all" && r.urgence !== filterUrgence) return false;
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (!q) return true;
      const hay = [
        r.reference,
        r.nom_complet,
        r.email,
        r.pays_destination,
        r.type_visa,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, filterUrgence, filterStatus]);

  const stats = useMemo(() => {
    const t = rows.length;
    const nouveau = rows.filter((r) => r.status === "nouveau").length;
    const enCours = rows.filter((r) => r.status === "en_cours").length;
    const critique = rows.filter(
      (r) => r.urgence === "critique" && r.status !== "traite"
    ).length;
    return { t, nouveau, enCours, critique };
  }, [rows]);

  // ─── Drawer : fetch détail à l'ouverture ────────────────────────────────
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    fetch(`/api/visa/express/${selectedId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.error) {
          toast.error(data.error);
          setSelectedId(null);
          return;
        }
        setDetail(data as DetailResponse);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[VISA_EXPRESS detail]", err);
        toast.error("Impossible de charger la demande");
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // ─── Esc ferme le drawer ────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const handleStatusChange = async (newStatus: VisaExpressRow["status"]) => {
    if (!detail || readOnly) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/visa/express/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        toast.error(data.error || "Échec de la mise à jour");
        return;
      }
      setDetail({ ...detail, status: newStatus });
      setRows((prev) =>
        prev.map((r) => (r.id === detail.id ? { ...r, status: newStatus } : r))
      );
      toast.success(`Statut → ${STATUS_META[newStatus].label}`);
    } catch (err) {
      console.error("[VISA_EXPRESS status]", err);
      toast.error("Erreur réseau");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── Stats compactes ────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total" value={stats.t} />
        <StatTile label="Nouveaux" value={stats.nouveau} accent="slate" />
        <StatTile label="En cours" value={stats.enCours} accent="blue" />
        <StatTile
          label="Critique non traité"
          value={stats.critique}
          accent="rose"
        />
      </div>

      {/* ─── Toolbar : recherche + filtres ──────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par référence, nom, email, pays…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-blue-950 placeholder:text-slate-400 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
          />
        </div>
        <div className="flex gap-2">
          <SelectFilter
            value={filterUrgence}
            onChange={setFilterUrgence}
            options={[
              { value: "all", label: "Toutes urgences" },
              { value: "critique", label: "Critique" },
              { value: "urgent", label: "Urgent" },
              { value: "normal", label: "Normal" },
            ]}
          />
          <SelectFilter
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: "all", label: "Tous statuts" },
              ...ALL_STATUS.map((s) => ({ value: s, label: STATUS_META[s].label })),
            ]}
          />
        </div>
      </div>

      {/* ─── Liste ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState hasRows={rows.length > 0} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/80"
                >
                  {/* Avatar initiales */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-950 text-xs font-semibold text-white">
                    {initials(r.nom_complet)}
                  </div>

                  {/* Identité + référence */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-nexus-blue-950">
                        {r.nom_complet}
                      </p>
                      <span className="hidden font-mono text-[10px] text-slate-400 sm:inline">
                        {r.reference}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{r.pays_destination}</span>
                      <span className="text-slate-300">·</span>
                      <span className="truncate">{r.type_visa}</span>
                    </p>
                  </div>

                  {/* Urgence */}
                  <span
                    className={cn(
                      "hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex",
                      URGENCE_META[r.urgence].className
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        URGENCE_META[r.urgence].dot,
                        r.urgence === "critique" && "animate-pulse"
                      )}
                    />
                    {URGENCE_META[r.urgence].label}
                  </span>

                  {/* Statut */}
                  <span
                    className={cn(
                      "hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex",
                      STATUS_META[r.status].className
                    )}
                  >
                    {STATUS_META[r.status].label}
                  </span>

                  {/* Date */}
                  <span className="hidden shrink-0 text-xs text-slate-400 lg:inline">
                    {relativeTime(r.created_at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Drawer side ────────────────────────────────────────────────── */}
      {selectedId && (
        <Drawer onClose={() => setSelectedId(null)}>
          {detailLoading || !detail ? (
            <DrawerSkeleton />
          ) : (
            <DrawerContent
              detail={detail}
              readOnly={readOnly}
              updating={updating}
              onStatusChange={handleStatusChange}
            />
          )}
        </Drawer>
      )}
    </div>
  );
}

// ─── Sous-composants ────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function StatTile({
  label,
  value,
  accent = "default",
}: {
  label: string;
  value: number;
  accent?: "default" | "slate" | "blue" | "rose";
}) {
  const valueClass = {
    default: "text-nexus-blue-950",
    slate: "text-slate-700",
    blue: "text-blue-700",
    rose: "text-rose-700",
  }[accent];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-3xl font-bold tabular-nums",
          valueClass
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-nexus-blue-950 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function EmptyState({ hasRows }: { hasRows: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
        <Inbox className="h-6 w-6" />
      </div>
      <p className="font-display text-base font-semibold text-nexus-blue-950">
        {hasRows ? "Aucun résultat" : "Aucune demande pour l'instant"}
      </p>
      <p className="mt-1 max-w-sm text-xs text-slate-500">
        {hasRows
          ? "Modifiez vos filtres ou la recherche pour élargir les résultats."
          : "Les demandes envoyées via le formulaire express apparaîtront ici."}
      </p>
    </div>
  );
}

function Drawer({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  // Body scroll lock
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex"
      role="dialog"
      aria-modal="true"
      aria-label="Détail de la demande"
    >
      <div
        className="flex-1 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Demande visa express
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">{children}</div>
      </aside>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-6 w-2/3 rounded-md bg-slate-200" />
      <div className="h-4 w-1/3 rounded-md bg-slate-200" />
      <div className="mt-8 space-y-3">
        <div className="h-3 w-full rounded-md bg-slate-100" />
        <div className="h-3 w-5/6 rounded-md bg-slate-100" />
        <div className="h-3 w-4/6 rounded-md bg-slate-100" />
      </div>
    </div>
  );
}

function DrawerContent({
  detail,
  readOnly,
  updating,
  onStatusChange,
}: {
  detail: DetailResponse;
  readOnly: boolean;
  updating: boolean;
  onStatusChange: (s: VisaExpressRow["status"]) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-nexus-orange-600">
          {detail.reference}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
          {detail.nom_complet}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
              URGENCE_META[detail.urgence].className
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                URGENCE_META[detail.urgence].dot
              )}
            />
            Urgence {URGENCE_META[detail.urgence].label}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
              STATUS_META[detail.status].className
            )}
          >
            {STATUS_META[detail.status].label}
          </span>
        </div>
      </div>

      {/* Coordonnées */}
      <section>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Coordonnées
        </p>
        <div className="space-y-2.5">
          <Row icon={Mail} label="E-mail">
            <a
              href={`mailto:${detail.email}`}
              className="text-nexus-orange-600 hover:underline"
            >
              {detail.email}
            </a>
          </Row>
          <Row icon={MessageCircle} label="WhatsApp">
            <a
              href={`https://wa.me/${detail.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="text-nexus-orange-600 hover:underline"
            >
              {detail.whatsapp}
            </a>
          </Row>
        </div>
      </section>

      {/* Demande */}
      <section>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Demande
        </p>
        <div className="space-y-2.5">
          <Row icon={MapPin} label="Destination">
            {detail.pays_destination}
          </Row>
          <Row icon={UserIcon} label="Type">
            {detail.type_visa}
          </Row>
          <Row icon={Clock} label="Reçue">
            {formatFullDate(detail.created_at)}
          </Row>
        </div>
      </section>

      {/* Notes */}
      {detail.notes && (
        <section>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Notes du client
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
            {detail.notes}
          </div>
        </section>
      )}

      {/* Documents */}
      <section>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Pièces jointes ({detail.documents.length})
        </p>
        {detail.documents.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune pièce jointe</p>
        ) : (
          <ul className="space-y-2">
            {detail.documents.map((d, i) => (
              <li key={i}>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 transition-colors hover:border-nexus-orange-300 hover:bg-nexus-orange-50/50"
                >
                  <FileText className="h-4 w-4 shrink-0 text-nexus-orange-600" />
                  <span className="min-w-0 flex-1 truncate">{d.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-colors group-hover:text-nexus-orange-600" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Actions de statut */}
      {!readOnly && (
        <section className="border-t border-slate-100 pt-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Changer le statut
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_STATUS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                disabled={updating || s === detail.status}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  s === detail.status
                    ? "cursor-default bg-nexus-blue-950 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-nexus-orange-300 hover:text-nexus-orange-700",
                  updating && "opacity-60"
                )}
              >
                {updating && s !== detail.status && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {s === detail.status && <CheckCircle2 className="h-3 w-3" />}
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </section>
      )}

      {readOnly && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <AlertTriangle className="mr-1 inline h-3 w-3" />
          Lecture seule — un admin peut changer le statut.
        </div>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-nexus-blue-950">{children}</p>
      </div>
    </div>
  );
}

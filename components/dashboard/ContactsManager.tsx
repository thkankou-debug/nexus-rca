"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Filter,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Search,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ContactRow {
  id: string;
  reference: string;
  nom: string;
  email: string;
  telephone: string | null;
  sujet: string;
  message: string;
  status: "nouveau" | "lu" | "repondu" | "archive";
  source: string | null;
  notes_internes: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_META: Record<
  ContactRow["status"],
  { label: string; className: string; dot: string }
> = {
  nouveau: {
    label: "Nouveau",
    className: "bg-nexus-orange-50 text-nexus-orange-700 ring-1 ring-nexus-orange-200/60",
    dot: "bg-nexus-orange-500",
  },
  lu: {
    label: "Lu",
    className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60",
    dot: "bg-blue-500",
  },
  repondu: {
    label: "Répondu",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
    dot: "bg-emerald-500",
  },
  archive: {
    label: "Archivé",
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/60",
    dot: "bg-slate-400",
  },
};

const ALL_STATUS: ContactRow["status"][] = ["nouveau", "lu", "repondu", "archive"];

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

function initials(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

interface Props {
  initialRows: ContactRow[];
  readOnly?: boolean;
}

export function ContactsManager({ initialRows, readOnly = false }: Props) {
  const [rows, setRows] = useState<ContactRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactRow["status"] | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<ContactRow["status"] | "all", number> = {
      all: rows.length,
      nouveau: 0,
      lu: 0,
      repondu: 0,
      archive: 0,
    };
    rows.forEach((r) => {
      c[r.status] += 1;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.nom.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.sujet.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  async function updateStatus(id: string, status: ContactRow["status"]) {
    if (readOnly) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erreur serveur");
      }
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                processed_at:
                  status === "lu" || status === "repondu"
                    ? new Date().toISOString()
                    : r.processed_at,
              }
            : r
        )
      );
      toast.success(`Statut mis à jour : ${STATUS_META[status].label}`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Mise à jour impossible");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Filtres + recherche ──────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white">
            <Filter className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
              Boîte de réception
            </p>
            <h2 className="text-base font-bold text-nexus-blue-950">
              {counts.all} message{counts.all > 1 ? "s" : ""} reçu{counts.all > 1 ? "s" : ""}
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher nom, email, sujet, référence…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-sm text-nexus-blue-950 placeholder:text-slate-400 focus:border-nexus-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
            />
          </div>
        </div>

        {/* Tabs status */}
        <div className="mt-4 flex flex-wrap gap-2">
          <FilterTab
            label="Tous"
            count={counts.all}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          {ALL_STATUS.map((s) => (
            <FilterTab
              key={s}
              label={STATUS_META[s].label}
              count={counts[s]}
              active={statusFilter === s}
              dotClassName={STATUS_META[s].dot}
              onClick={() => setStatusFilter(s)}
            />
          ))}
        </div>
      </div>

      {/* ─── Liste ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            {rows.length === 0
              ? "Aucun message pour le moment."
              : "Aucun message ne correspond aux filtres."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => {
            const isOpen = openId === row.id;
            const meta = STATUS_META[row.status];
            const isSaving = savingId === row.id;

            return (
              <li
                key={row.id}
                className={cn(
                  "overflow-hidden rounded-3xl border bg-white shadow-sm transition-colors",
                  row.status === "nouveau"
                    ? "border-nexus-orange-200/70"
                    : "border-slate-200"
                )}
              >
                {/* Header row */}
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : row.id)}
                  className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-slate-50/60"
                >
                  {/* Avatar initiales */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 text-sm font-bold text-white shadow-sm">
                    {initials(row.nom) || "?"}
                  </div>

                  {/* Contenu */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-nexus-blue-950">{row.nom}</p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          meta.className
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                        {meta.label}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {row.reference}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-700">
                      {row.sujet}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {row.message}
                    </p>
                  </div>

                  {/* Date + chevron */}
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[11px] text-slate-400">
                      {relativeTime(row.created_at)}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Drawer ouvert */}
                {isOpen && (
                  <div className="border-t border-slate-200 bg-slate-50/40 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InfoRow
                        icon={Mail}
                        label="Email"
                        value={
                          <a
                            href={`mailto:${row.email}?subject=Re: ${encodeURIComponent(row.sujet)}`}
                            className="text-nexus-orange-600 hover:underline"
                          >
                            {row.email}
                          </a>
                        }
                      />
                      {row.telephone && (
                        <InfoRow
                          icon={Phone}
                          label="Téléphone"
                          value={
                            <a
                              href={`tel:${row.telephone}`}
                              className="text-nexus-orange-600 hover:underline"
                            >
                              {row.telephone}
                            </a>
                          }
                        />
                      )}
                      <InfoRow
                        icon={UserIcon}
                        label="Reçu le"
                        value={formatFullDate(row.created_at)}
                      />
                      {row.processed_at && (
                        <InfoRow
                          icon={CheckCheck}
                          label="Traité le"
                          value={formatFullDate(row.processed_at)}
                        />
                      )}
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Message
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-nexus-blue-950">
                        {row.message}
                      </p>
                    </div>

                    {!readOnly && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        <a
                          href={`mailto:${row.email}?subject=Re: ${encodeURIComponent(row.sujet)}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nexus-orange-600"
                        >
                          <Mail className="h-4 w-4" />
                          Répondre par email
                        </a>
                        {row.telephone && (
                          <a
                            href={`https://wa.me/${row.telephone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-nexus-blue-950 shadow-sm transition-colors hover:border-nexus-orange-300/70 hover:bg-slate-50"
                          >
                            <MessageCircle className="h-4 w-4 text-nexus-orange-600" />
                            WhatsApp
                          </a>
                        )}

                        <div className="ml-auto flex flex-wrap gap-2">
                          {row.status !== "lu" && row.status !== "repondu" && (
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => updateStatus(row.id, "lu")}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-50"
                            >
                              {isSaving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              Marquer comme lu
                            </button>
                          )}
                          {row.status !== "repondu" && (
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => updateStatus(row.id, "repondu")}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                            >
                              {isSaving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCheck className="h-3.5 w-3.5" />
                              )}
                              Marquer répondu
                            </button>
                          )}
                          {row.status !== "archive" && (
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => updateStatus(row.id, "archive")}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                            >
                              {isSaving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Archive className="h-3.5 w-3.5" />
                              )}
                              Archiver
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Sous-composants ────────────────────────────────────────────────────────
function FilterTab({
  label,
  count,
  active,
  dotClassName,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  dotClassName?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-nexus-blue-950 text-white"
          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
      )}
    >
      {dotClassName && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} />
      )}
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
          active ? "bg-white/15 text-white" : "bg-white text-slate-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <div className="mt-0.5 truncate text-sm text-nexus-blue-950">{value}</div>
      </div>
    </div>
  );
}

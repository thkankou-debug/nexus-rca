"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Plane,
  Flag,
  Cake,
  ClipboardCheck,
} from "lucide-react";
import { formatDateShort } from "@/components/dashboard/rh/format";

// ─── TYPES ────────────────────────────────────────────────────────────
interface LeaveEvent {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  statut: string;
  employees: { nom_complet: string; poste: string | null } | null;
  leave_types: { label: string; color_hex: string } | null;
}

interface HolidayEvent {
  id: string;
  year: number;
  date: string;
  label: string;
  fixed: boolean;
}

interface EmployeeRow {
  id: string;
  nom_complet: string;
  date_naissance: string | null;
  date_embauche: string | null;
  type_contrat: string | null;
  poste: string | null;
  statut: string;
}

type ApiResponse = {
  success: boolean;
  events?: {
    leaves: LeaveEvent[];
    holidays: HolidayEvent[];
    employees: EmployeeRow[];
  };
  error?: string;
};

type DayEvent =
  | { kind: "leave"; data: LeaveEvent }
  | { kind: "holiday"; data: HolidayEvent }
  | { kind: "birthday"; data: EmployeeRow }
  | { kind: "trial_end"; data: EmployeeRow };

interface FiltersState {
  leaves: boolean;
  holidays: boolean;
  birthdays: boolean;
  trialEnds: boolean;
}

// ─── HELPERS ──────────────────────────────────────────────────────────
const FRENCH_MONTHS_LONG = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Retourne true si la date YYYY-MM-DD est dans la plage [start, end] inclusive. */
function dateInRange(target: string, start: string, end: string): boolean {
  return target >= start && target <= end;
}

/**
 * Période d'essai : on considère 3 mois après la date d'embauche (CDI).
 * Pour CDD/Stage : on simule une fin à 3 mois aussi (placeholder utile).
 */
function trialEndDate(emp: EmployeeRow): Date | null {
  if (!emp.date_embauche) return null;
  const d = new Date(emp.date_embauche);
  if (Number.isNaN(d.getTime())) return null;
  const end = new Date(d);
  end.setMonth(end.getMonth() + 3);
  return end;
}

// ─── COMPOSANT ─────────────────────────────────────────────────────────
export function LeaveCalendar() {
  const today = new Date();
  const [cursor, setCursor] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [data, setData] = useState<ApiResponse["events"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    leaves: true,
    holidays: true,
    birthdays: true,
    trialEnds: true,
  });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Fetch données pour le mois courant (étendu sur grille 6 semaines)
  useEffect(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    setLoading(true);
    setError(null);
    const url = `/api/rh/calendar?start=${start.toISOString()}&end=${end.toISOString()}`;
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((json: ApiResponse) => {
        if (!json.success) {
          setError(json.error ?? "Erreur de chargement");
        } else {
          setData(json.events ?? null);
        }
      })
      .catch((e) => {
        console.error("[LEAVE_CALENDAR] fetch", e);
        setError("Erreur de chargement");
      })
      .finally(() => setLoading(false));
  }, [cursor]);

  // ─── Calcul de la grille (6 semaines × 7 jours) ─────────────────────
  const weeks = useMemo(() => {
    const first = startOfMonth(cursor);
    // getDay: 0=dim, 1=lun ... → on veut lundi=0
    const offset = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - offset);

    const result: Date[][] = [];
    for (let w = 0; w < 6; w += 1) {
      const row: Date[] = [];
      for (let d = 0; d < 7; d += 1) {
        const cell = new Date(gridStart);
        cell.setDate(gridStart.getDate() + w * 7 + d);
        row.push(cell);
      }
      result.push(row);
    }
    return result;
  }, [cursor]);

  // ─── Calcul des events par jour ─────────────────────────────────────
  const eventsByDay = useMemo(() => {
    const map = new Map<string, DayEvent[]>();
    if (!data) return map;

    const monthYear = cursor.getFullYear();
    const monthIndex = cursor.getMonth();

    if (filters.leaves) {
      for (const lv of data.leaves) {
        const start = new Date(lv.start_date);
        const end = new Date(lv.end_date);
        const cur = new Date(start);
        while (cur <= end) {
          const key = ymd(cur);
          const arr = map.get(key) ?? [];
          arr.push({ kind: "leave", data: lv });
          map.set(key, arr);
          cur.setDate(cur.getDate() + 1);
        }
      }
    }

    if (filters.holidays) {
      for (const h of data.holidays) {
        const key = h.date.split("T")[0];
        const arr = map.get(key) ?? [];
        arr.push({ kind: "holiday", data: h });
        map.set(key, arr);
      }
    }

    if (filters.birthdays) {
      for (const emp of data.employees) {
        if (!emp.date_naissance) continue;
        const dn = new Date(emp.date_naissance);
        if (Number.isNaN(dn.getTime())) continue;
        const key = `${monthYear}-${pad2(dn.getMonth() + 1)}-${pad2(dn.getDate())}`;
        if (dn.getMonth() !== monthIndex) continue;
        const arr = map.get(key) ?? [];
        arr.push({ kind: "birthday", data: emp });
        map.set(key, arr);
      }
    }

    if (filters.trialEnds) {
      for (const emp of data.employees) {
        const te = trialEndDate(emp);
        if (!te) continue;
        if (te.getMonth() !== monthIndex || te.getFullYear() !== monthYear)
          continue;
        const key = ymd(te);
        const arr = map.get(key) ?? [];
        arr.push({ kind: "trial_end", data: emp });
        map.set(key, arr);
      }
    }

    return map;
  }, [data, cursor, filters]);

  const goPrev = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNext = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  const goToday = () =>
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  // Vue agenda mobile : tous les jours du mois avec events triés
  const agendaDays = useMemo(() => {
    const result: Array<{ date: Date; events: DayEvent[] }> = [];
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    for (let d = 1; d <= last.getDate(); d += 1) {
      const date = new Date(first.getFullYear(), first.getMonth(), d);
      const events = eventsByDay.get(ymd(date)) ?? [];
      if (events.length > 0) result.push({ date, events });
    }
    return result;
  }, [cursor, eventsByDay]);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-8 shadow-lg sm:px-9 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[24rem] w-[24rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
        />
        <div className="relative flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur-md">
              Calendrier RH
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Vue agrégée
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Congés validés, jours fériés, anniversaires et fins de période
              d&apos;essai sur un seul écran.
            </p>
          </div>
        </div>
      </section>

      {/* TOOLBAR : Mois + Filtres */}
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Mois précédent"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-nexus-orange-300 hover:text-nexus-orange-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="font-display text-lg font-bold text-nexus-blue-950 sm:text-xl">
            {FRENCH_MONTHS_LONG[cursor.getMonth()]} {cursor.getFullYear()}
          </p>
          <button
            type="button"
            onClick={goNext}
            aria-label="Mois suivant"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-nexus-orange-300 hover:text-nexus-orange-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="ml-1 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-nexus-orange-300 hover:text-nexus-orange-700"
          >
            Aujourd&apos;hui
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterToggle
            active={filters.leaves}
            onClick={() =>
              setFilters((f) => ({ ...f, leaves: !f.leaves }))
            }
            label="Congés"
            color="bg-nexus-blue-700"
            icon={Plane}
          />
          <FilterToggle
            active={filters.holidays}
            onClick={() =>
              setFilters((f) => ({ ...f, holidays: !f.holidays }))
            }
            label="Fériés"
            color="bg-rose-500"
            icon={Flag}
          />
          <FilterToggle
            active={filters.birthdays}
            onClick={() =>
              setFilters((f) => ({ ...f, birthdays: !f.birthdays }))
            }
            label="Anniversaires"
            color="bg-purple-500"
            icon={Cake}
          />
          <FilterToggle
            active={filters.trialEnds}
            onClick={() =>
              setFilters((f) => ({ ...f, trialEnds: !f.trialEnds }))
            }
            label="Fins d&apos;essai"
            color="bg-nexus-orange-500"
            icon={ClipboardCheck}
          />
        </div>
      </section>

      {/* GRILLE DESKTOP / AGENDA MOBILE */}
      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-nexus-orange-500" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          {error}
        </div>
      ) : (
        <>
          {/* DESKTOP : grille mois */}
          <section className="hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:block">
            {/* Headers jours */}
            <div className="grid grid-cols-7 gap-1 border-b border-slate-100 pb-2">
              {WEEK_DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Cellules */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {weeks.flat().map((day) => {
                const inMonth = day.getMonth() === cursor.getMonth();
                const isToday = isSameDay(day, today);
                const events = eventsByDay.get(ymd(day)) ?? [];
                return (
                  <button
                    type="button"
                    key={ymd(day)}
                    onClick={() => events.length > 0 && setSelectedDay(day)}
                    className={`relative flex min-h-[88px] flex-col items-start rounded-xl border p-2 text-left transition ${
                      inMonth
                        ? "border-slate-100 bg-white hover:border-nexus-orange-200"
                        : "border-slate-100 bg-slate-50/40 text-slate-400"
                    } ${isToday ? "ring-2 ring-nexus-orange-400" : ""} ${
                      events.length > 0 ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        isToday
                          ? "text-nexus-orange-600"
                          : inMonth
                            ? "text-nexus-blue-950"
                            : "text-slate-400"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {events.length > 0 && (
                      <DayEventsPreview events={events} />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* MOBILE : vue agenda */}
          <section className="sm:hidden">
            {agendaDays.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                Aucun événement ce mois-ci.
              </div>
            ) : (
              <div className="space-y-3">
                {agendaDays.map(({ date, events }) => {
                  const isToday = isSameDay(date, today);
                  return (
                    <article
                      key={ymd(date)}
                      className={`rounded-2xl border p-4 shadow-sm ${
                        isToday
                          ? "border-nexus-orange-300 bg-nexus-orange-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        {formatDateShort(ymd(date))}
                      </p>
                      <div className="mt-2 space-y-2">
                        {events.map((ev, i) => (
                          <EventLine key={`${ymd(date)}-${i}`} event={ev} />
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* LEGENDE */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Légende
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Legend color="bg-nexus-blue-700" label="Congés validés" />
          <Legend color="bg-rose-500" label="Jours fériés CAR" />
          <Legend color="bg-purple-500" label="Anniversaires" />
          <Legend color="bg-nexus-orange-500" label="Fins de période d&apos;essai" />
        </div>
      </section>

      {/* MODAL DETAIL JOUR */}
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          events={eventsByDay.get(ymd(selectedDay)) ?? []}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

// ─── SOUS-COMPOSANTS ──────────────────────────────────────────────────

function FilterToggle({
  active,
  onClick,
  label,
  color,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-nexus-blue-950 bg-nexus-blue-950 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function DayEventsPreview({ events }: { events: DayEvent[] }) {
  // Affiche au plus 3 dots colorés + un compteur
  const dots = events.slice(0, 3);
  const extra = events.length - dots.length;
  return (
    <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
      {dots.map((ev, i) => {
        let color = "#0C1C40";
        if (ev.kind === "leave")
          color = ev.data.leave_types?.color_hex ?? "#0C1C40";
        else if (ev.kind === "holiday") color = "#E11D48";
        else if (ev.kind === "birthday") color = "#A855F7";
        else if (ev.kind === "trial_end") color = "#FF6600";
        return (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        );
      })}
      {extra > 0 && (
        <span className="text-[9px] font-bold tabular-nums text-slate-500">
          +{extra}
        </span>
      )}
    </div>
  );
}

function EventLine({ event }: { event: DayEvent }) {
  if (event.kind === "leave") {
    const lv = event.data;
    const color = lv.leave_types?.color_hex ?? "#0C1C40";
    return (
      <div className="flex items-start gap-2">
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0 text-sm">
          <span className="font-semibold text-nexus-blue-950">
            {lv.employees?.nom_complet ?? "Employé"}
          </span>{" "}
          <span className="text-slate-500">·</span>{" "}
          <span style={{ color }}>{lv.leave_types?.label ?? "Congé"}</span>
        </div>
      </div>
    );
  }
  if (event.kind === "holiday") {
    return (
      <div className="flex items-start gap-2">
        <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
        <div className="text-sm font-semibold text-rose-700">
          {event.data.label}
        </div>
      </div>
    );
  }
  if (event.kind === "birthday") {
    return (
      <div className="flex items-start gap-2">
        <Cake className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-600" />
        <div className="text-sm">
          <span className="font-semibold text-purple-700">Anniversaire</span>{" "}
          <span className="text-slate-700">· {event.data.nom_complet}</span>
        </div>
      </div>
    );
  }
  // trial_end
  return (
    <div className="flex items-start gap-2">
      <ClipboardCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-600" />
      <div className="text-sm">
        <span className="font-semibold text-nexus-orange-700">
          Fin d&apos;essai
        </span>{" "}
        <span className="text-slate-700">· {event.data.nom_complet}</span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-slate-700">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function DayDetailModal({
  day,
  events,
  onClose,
}: {
  day: Date;
  events: DayEvent[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
              Détail du jour
            </p>
            <p className="mt-1 font-display text-base font-bold text-nexus-blue-950">
              {formatDateShort(ymd(day))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun événement.</p>
          ) : (
            <div className="space-y-3">
              {events.map((ev, i) => (
                <EventLine key={i} event={ev} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

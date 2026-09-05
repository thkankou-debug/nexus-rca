"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  GraduationCap,
  Plane,
  Hotel,
  Send,
  MessageSquare,
  Briefcase,
  Languages,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// CONFIGURATION
// ============================================================================
const SERVICES = [
  { id: "visa", label: "Visa / e-Visa", icon: Plane, description: "Démarches visa internationales" },
  { id: "bourse", label: "Études / Bourses", icon: GraduationCap, description: "Études au Canada, Europe..." },
  { id: "tcf", label: "TCF / Test de français", icon: Languages, description: "Inscription et préparation" },
  { id: "billet", label: "Billet d'avion", icon: Plane, description: "Réservation de billets" },
  { id: "hotel", label: "Hôtel", icon: Hotel, description: "Réservation d'hébergement" },
  { id: "transfert", label: "Transfert d'argent", icon: Send, description: "Envoi international" },
  { id: "consultation_generale", label: "Consultation générale", icon: MessageSquare, description: "Discussion ouverte" },
  { id: "autre", label: "Autre demande", icon: HelpCircle, description: "Je précise après" },
];

const ALL_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const MOIS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const JOURS_FR = ["L", "M", "M", "J", "V", "S", "D"];

interface NewAppointmentFormProps {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
}

export default function NewAppointmentForm({
  initialName,
  initialEmail,
  initialPhone,
}: NewAppointmentFormProps) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [confirmedRef, setConfirmedRef] = useState<string>("");

  // ============================================================================
  // CALENDRIER : GÉNÉRATION DES JOURS DU MOIS
  // ============================================================================
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Lundi = 0, Dimanche = 6
  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;

  const calendarDays: ({ day: number; date: string; isWeekend: boolean; isPast: boolean; isTooFar: boolean } | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    calendarDays.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isPast = dateObj < today;
    const isTooFar = dateObj > maxDate;
    calendarDays.push({ day: d, date: dateStr, isWeekend, isPast, isTooFar });
  }

  const canGoPrevious = (() => {
    const prev = new Date(year, month - 1, 1);
    const prevLast = new Date(year, month, 0);
    return prevLast >= today;
  })();

  const canGoNext = (() => {
    const next = new Date(year, month + 1, 1);
    return next <= maxDate;
  })();

  // ============================================================================
  // CHARGEMENT DES CRÉNEAUX QUAND DATE CHANGE
  // ============================================================================
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError("");
      try {
        const res = await fetch(
          `/api/appointments/available-slots?date=${selectedDate}`
        );
        const data = await res.json();
        if (res.ok) {
          setAvailableSlots(data.available_slots || []);
          setOccupiedSlots(data.occupied_slots || []);
        } else {
          setError(data.error || "Erreur lors du chargement des créneaux");
        }
      } catch {
        setError("Erreur réseau");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  // ============================================================================
  // SOUMISSION
  // ============================================================================
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_type: selectedService,
          rdv_date: selectedDate,
          rdv_heure: selectedTime,
          notes_client: notes,
          client_nom: initialName,
          client_email: initialEmail,
          client_telephone: initialPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du rendez-vous");
        setSubmitting(false);
        return;
      }

      // Envoi email confirmation (best-effort, ne bloque pas)
      try {
        await fetch("/api/appointments/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointment_id: data.appointment.id }),
        });
      } catch (e) {
        console.warn("Email confirmation non envoyé:", e);
      }

      setConfirmedRef(data.appointment.reference);
      setStep(4);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateLong = (dateStr: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const selectedServiceData = SERVICES.find((s) => s.id === selectedService);

  // ============================================================================
  // RENDU
  // ============================================================================

  // ÉTAPE 4 : CONFIRMATION
  if (step === 4) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-green-200 bg-white shadow-lg">
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold text-white">
              Rendez-vous confirmé !
            </h1>
            <p className="mt-2 text-green-50">
              Votre demande de rendez-vous a bien été enregistrée.
            </p>
          </div>

          <div className="space-y-4 p-6 sm:p-8">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Référence du RDV
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
                {confirmedRef}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Service
                </p>
                <p className="mt-1 font-semibold text-nexus-blue-950">
                  {selectedServiceData?.label}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Date et heure
                </p>
                <p className="mt-1 font-semibold text-nexus-blue-950">
                  {formatDateLong(selectedDate)}
                </p>
                <p className="text-sm text-slate-600">à {selectedTime}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                📧 Un email de confirmation vient de vous être envoyé à <strong>{initialEmail}</strong>.
              </p>
              <p className="mt-2 text-sm text-blue-900">
                ⏳ Notre équipe va confirmer votre rendez-vous très prochainement.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard/client/rdv"
                className="flex-1 rounded-full bg-nexus-blue-950 px-5 py-3 text-center text-sm font-semibold text-white shadow hover:bg-nexus-blue-900"
              >
                Voir mes rendez-vous
              </Link>
              <Link
                href="/dashboard/client"
                className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-nexus-blue-950 hover:bg-slate-50"
              >
                Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ÉTAPES 1-3
  return (
    <div className="mx-auto max-w-3xl">
      {/* HEADER */}
      <Link
        href="/dashboard/client/rdv"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-nexus-blue-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à mes rendez-vous
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
          Réserver un rendez-vous
        </h1>
        <p className="mt-2 text-slate-600">
          Choisissez le service, la date et l&apos;heure qui vous conviennent.
        </p>
      </div>

      {/* PROGRESSION */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                s < step
                  ? "bg-green-500 text-white"
                  : s === step
                    ? "bg-nexus-blue-950 text-white shadow-lg"
                    : "bg-slate-200 text-slate-500"
              )}
            >
              {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  "h-1 flex-1 rounded-full transition",
                  s < step ? "bg-green-500" : "bg-slate-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* CONTENU SELON L'ÉTAPE */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {/* ÉTAPE 1 : SERVICE */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
                Étape 1 / 3
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
                Quel service vous intéresse ?
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                const isSelected = selectedService === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedService(s.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition",
                      isSelected
                        ? "border-nexus-orange-500 bg-nexus-orange-50 shadow"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
                        isSelected
                          ? "bg-nexus-orange-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-nexus-blue-950">{s.label}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{s.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedService}
                className="inline-flex items-center gap-1.5 rounded-full bg-nexus-blue-950 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-nexus-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 2 : DATE + HEURE */}
        {step === 2 && (
          <>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
                Étape 2 / 3
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
                Choisissez votre créneau
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Disponible du lundi au vendredi · 09h-17h
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* CALENDRIER */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (canGoPrevious) {
                        setCalendarMonth(new Date(year, month - 1, 1));
                      }
                    }}
                    disabled={!canGoPrevious}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <p className="font-display text-base font-bold text-nexus-blue-950">
                    {MOIS_FR[month]} {year}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (canGoNext) {
                        setCalendarMonth(new Date(year, month + 1, 1));
                      }
                    }}
                    disabled={!canGoNext}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1">
                  {JOURS_FR.map((j, i) => (
                    <div key={i} className="text-center text-[10px] font-bold uppercase text-slate-400">
                      {j}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const isDisabled = d.isWeekend || d.isPast || d.isTooFar;
                    const isSelected = selectedDate === d.date;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedDate(d.date);
                            setSelectedTime("");
                          }
                        }}
                        disabled={isDisabled}
                        className={cn(
                          "flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition",
                          isSelected
                            ? "bg-nexus-blue-950 text-white shadow-lg"
                            : isDisabled
                              ? "cursor-not-allowed text-slate-300"
                              : "text-slate-700 hover:bg-nexus-orange-100 hover:text-nexus-orange-700"
                        )}
                      >
                        {d.day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-nexus-blue-950" />
                    Sélectionné
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-nexus-orange-100" />
                    Disponible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-slate-100" />
                    Indisponible
                  </span>
                </div>
              </div>

              {/* CRÉNEAUX */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-nexus-orange-600" />
                  <p className="font-display text-base font-bold text-nexus-blue-950">
                    Créneaux disponibles
                  </p>
                </div>

                {!selectedDate ? (
                  <div className="flex h-48 items-center justify-center rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-sm text-slate-500">
                      ← Sélectionnez d&apos;abord une date
                    </p>
                  </div>
                ) : loadingSlots ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                    <AlertCircle className="mx-auto h-6 w-6 text-amber-600" />
                    <p className="mt-2 text-sm font-semibold text-amber-900">
                      Aucun créneau disponible
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      Tous les créneaux sont pris ce jour. Choisissez une autre date.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-xs text-slate-600">
                      {formatDateLong(selectedDate)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {ALL_SLOTS.map((slot) => {
                        const isAvailable = availableSlots.includes(slot);
                        const isOccupied = occupiedSlots.includes(slot);
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              if (isAvailable) setSelectedTime(slot);
                            }}
                            disabled={!isAvailable}
                            className={cn(
                              "rounded-lg border-2 px-3 py-2 text-sm font-semibold transition",
                              isSelected
                                ? "border-nexus-blue-950 bg-nexus-blue-950 text-white shadow"
                                : isAvailable
                                  ? "border-slate-200 bg-white text-slate-700 hover:border-nexus-orange-300 hover:bg-nexus-orange-50"
                                  : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through"
                            )}
                            title={isOccupied ? "Créneau occupé" : ""}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="inline-flex items-center gap-1.5 rounded-full bg-nexus-blue-950 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-nexus-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 3 : RÉCAPITULATIF + NOTES */}
        {step === 3 && (
          <>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
                Étape 3 / 3
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
                Récapitulatif et confirmation
              </h2>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Service
                </p>
                <p className="mt-1 font-semibold text-nexus-blue-950">
                  {selectedServiceData?.label}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Date et heure
                </p>
                <p className="mt-1 font-semibold text-nexus-blue-950">
                  {formatDateLong(selectedDate)}
                </p>
                <p className="text-sm text-slate-600">à {selectedTime}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Vos coordonnées
                </p>
                <p className="mt-1 text-sm text-slate-700">{initialName}</p>
                <p className="text-sm text-slate-600">{initialEmail}</p>
                {initialPhone && <p className="text-sm text-slate-600">{initialPhone}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-nexus-blue-950">
                  Notes ou questions (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Précisez votre demande, vos questions..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-full bg-nexus-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-nexus-orange-600 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Réservation en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmer ma réservation
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

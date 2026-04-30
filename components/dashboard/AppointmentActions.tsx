"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  UserPlus,
  AlertTriangle,
  Clock,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  prenom?: string | null;
  nom?: string | null;
}

interface AppointmentActionsProps {
  appointmentId: string;
  currentStatus: string;
  currentAgentId: string | null;
  agents: Agent[];
  isSuperAdmin?: boolean;
  canTake?: boolean;
  agentId?: string;
}

export function AppointmentActions({
  appointmentId,
  currentStatus,
  currentAgentId,
  agents,
  isSuperAdmin = false,
  canTake = false,
  agentId,
}: AppointmentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [error, setError] = useState("");

  const callApi = async (action: string, payload: Record<string, unknown> = {}) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
      setShowAssign(false);
    }
  };

  const isClosed = ["termine", "annule_client", "annule_agent", "absent"].includes(currentStatus);

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {canTake && !currentAgentId && agentId && (
          <button
            type="button"
            onClick={() => callApi("assign", { agent_id: agentId })}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full bg-nexus-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-nexus-orange-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
            Prendre ce RDV
          </button>
        )}

        {currentStatus === "en_attente" && !isClosed && (
          <button
            type="button"
            onClick={() => callApi("confirm")}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
            Confirmer
          </button>
        )}

        {currentStatus === "confirme" && (
          <button
            type="button"
            onClick={() => callApi("complete")}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
            Terminé
          </button>
        )}

        {currentStatus === "confirme" && (
          <button
            type="button"
            onClick={() => callApi("mark_absent")}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            <AlertTriangle className="h-3 w-3" />
            Absent
          </button>
        )}

        {!isClosed && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Annuler ce rendez-vous ?")) {
                callApi("cancel");
              }
            }}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <XCircle className="h-3 w-3" />
            Annuler
          </button>
        )}

        {isSuperAdmin && isClosed && (
          <button
            type="button"
            onClick={() => callApi("reopen")}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-600 disabled:opacity-50"
          >
            <Clock className="h-3 w-3" />
            Réouvrir
          </button>
        )}

        {isSuperAdmin && !isClosed && agents.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAssign(!showAssign)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <UserPlus className="h-3 w-3" />
              {currentAgentId ? "Réassigner" : "Assigner"}
              <ChevronDown className="h-3 w-3" />
            </button>

            {showAssign && (
              <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="max-h-64 overflow-y-auto p-1">
                  {agents.map((a) => {
                    const name = [a.prenom, a.nom].filter(Boolean).join(" ");
                    const isCurrent = a.id === currentAgentId;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => callApi("assign", { agent_id: a.id })}
                        disabled={loading || isCurrent}
                        className={cn(
                          "block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition",
                          isCurrent
                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                            : "text-slate-700 hover:bg-nexus-orange-50"
                        )}
                      >
                        {name || "Agent sans nom"}
                        {isCurrent && <span className="ml-2 text-[10px]">(actuel)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

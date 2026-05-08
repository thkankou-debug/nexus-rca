"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, MessageCircle, Send, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  author_id: string | null;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
};

const MAX_LENGTH = 1000;

/**
 * Fil de messages client ↔ conseiller — client component.
 * Realtime via supabase channels.
 */
export function MessagesList({
  demandeId,
  currentUserId,
}: {
  demandeId: string;
  currentUserId: string;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // ===== Chargement initial + abonnement realtime =====
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("demande_messages")
        .select("id, author_id, author_name, author_role, content, created_at")
        .eq("demande_id", demandeId)
        .order("created_at", { ascending: true });
      if (!cancelled) setMessages((data || []) as Message[]);
    })();

    // Realtime subscription
    const channel = supabase
      .channel(`demande_messages_${demandeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "demande_messages",
          filter: `demande_id=eq.${demandeId}`,
        },
        (payload) => {
          if (cancelled) return;
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (!prev) return [msg];
            // Éviter les doublons (par id)
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [demandeId, supabase]);

  // ===== Auto-scroll en bas =====
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_LENGTH) {
      toast.error(`Message trop long (max ${MAX_LENGTH} caractères)`);
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/demandes/${demandeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }
      setContent("");
      // Le realtime ajoutera automatiquement le message
      toast.success("Message envoyé");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (s: string) => {
    try {
      const d = new Date(s);
      const now = new Date();
      const sameDay = d.toDateString() === now.toDateString();
      if (sameDay) {
        return d.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return s;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 p-4">
        <MessageCircle className="h-3.5 w-3.5 text-nexus-orange-500" />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Messages
        </p>
        {messages && (
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {messages.length}
          </span>
        )}
      </div>

      <div
        ref={listRef}
        className="max-h-96 space-y-3 overflow-y-auto p-4"
        id="messages"
      >
        {messages === null ? (
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Chargement…
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs italic text-slate-400">
            Aucun message pour le moment.
            <br />
            Échangez avec votre conseiller dès qu&rsquo;il aura pris en charge votre dossier.
          </p>
        ) : (
          messages.map((m) => {
            const isMe = m.author_id === currentUserId;
            const isStaff =
              m.author_role === "agent" ||
              m.author_role === "admin" ||
              m.author_role === "super_admin";
            return (
              <div
                key={m.id}
                className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                    isMe
                      ? "bg-nexus-orange-500"
                      : isStaff
                        ? "bg-nexus-blue-700"
                        : "bg-slate-400"
                  )}
                >
                  {isMe ? (
                    "Moi"
                  ) : (
                    m.author_name
                      .split(" ")
                      .map((p) => p[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || <UserCircle className="h-4 w-4" />
                  )}
                </div>
                <div className={cn("flex-1", isMe ? "text-right" : "text-left")}>
                  <div
                    className={cn(
                      "inline-block max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      isMe
                        ? "bg-nexus-orange-500 text-white"
                        : "bg-slate-100 text-slate-800"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      isMe ? "text-slate-400" : "text-slate-500"
                    )}
                  >
                    {!isMe && (
                      <span className="font-semibold">{m.author_name} · </span>
                    )}
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-slate-100 p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="Écrivez votre message…"
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-nexus-blue-950 focus:border-nexus-orange-400 focus:outline-none focus:ring-1 focus:ring-nexus-orange-300"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            {content.length} / {MAX_LENGTH}
          </span>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-nexus-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

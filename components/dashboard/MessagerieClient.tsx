"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Send,
  Users,
  User as UserIcon,
  Paperclip,
  Smile,
  CheckCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export interface Thread {
  id: string;
  title: string;
  subtitle: string;
  participants: string[];
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_team_thread: boolean;
}

export interface Message {
  id: string;
  thread_id: string;
  author: string;
  author_role: "super_admin" | "admin" | "agent" | "client" | "system";
  body: string;
  created_at: string;
}

const ROLE_BADGE: Record<Message["author_role"], string> = {
  super_admin: "bg-rose-100 text-rose-700",
  admin: "bg-violet-100 text-violet-700",
  agent: "bg-emerald-100 text-emerald-700",
  client: "bg-blue-100 text-blue-700",
  system: "bg-slate-100 text-slate-700",
};

const ROLE_LABEL: Record<Message["author_role"], string> = {
  super_admin: "Super-admin",
  admin: "Admin",
  agent: "Agent",
  client: "Client",
  system: "Système",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function formatFullTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  initialThreads: Thread[];
  initialMessagesByThread: Record<string, Message[]>;
  currentUser: string;
}

export function MessagerieClient({
  initialThreads,
  initialMessagesByThread,
  currentUser,
}: Props) {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>(
    initialMessagesByThread
  );
  const [selectedId, setSelectedId] = useState<string>(initialThreads[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "team" | "clients" | "unread">("all");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return threads.filter((t) => {
      if (filter === "team" && !t.is_team_thread) return false;
      if (filter === "clients" && t.is_team_thread) return false;
      if (filter === "unread" && t.unread_count === 0) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.last_message.toLowerCase().includes(q)
      );
    });
  }, [threads, search, filter]);

  const selectedThread = threads.find((t) => t.id === selectedId);
  const messages = selectedId ? messagesByThread[selectedId] ?? [] : [];

  function handleSelect(id: string) {
    setSelectedId(id);
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unread_count: 0 } : t))
    );
  }

  function handleSend() {
    const body = draft.trim();
    if (!body || !selectedThread) return;
    setSending(true);

    setTimeout(() => {
      const newMsg: Message = {
        id: `m_${Date.now()}`,
        thread_id: selectedThread.id,
        author: currentUser,
        author_role: "super_admin",
        body,
        created_at: new Date().toISOString(),
      };

      setMessagesByThread((prev) => ({
        ...prev,
        [selectedThread.id]: [...(prev[selectedThread.id] ?? []), newMsg],
      }));

      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThread.id
            ? { ...t, last_message: body, last_message_at: newMsg.created_at }
            : t
        )
      );

      setDraft("");
      setSending(false);
      toast.success("Message envoyé");
    }, 300);
  }

  const totalUnread = threads.reduce((sum, t) => sum + t.unread_count, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]" style={{ height: "calc(100vh - 280px)", minHeight: 600 }}>
      {/* ─── Sidebar threads ─────────────────────────────────────── */}
      <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-nexus-blue-950">
              Conversations
            </h2>
            {totalUnread > 0 && (
              <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-nexus-orange-500 px-2 text-xs font-semibold text-white">
                {totalUnread}
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une conversation…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-nexus-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(
              [
                { key: "all", label: "Toutes" },
                { key: "team", label: "Équipe" },
                { key: "clients", label: "Clients" },
                { key: "unread", label: "Non lues" },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  filter === f.key
                    ? "bg-nexus-blue-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Aucune conversation trouvée.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredThreads.map((t) => {
                const isActive = t.id === selectedId;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => handleSelect(t.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                        isActive
                          ? "bg-nexus-orange-50/70"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                          t.is_team_thread
                            ? "bg-violet-100 text-violet-700"
                            : "bg-gradient-to-br from-nexus-orange-100 to-nexus-orange-200 text-nexus-orange-700"
                        )}
                      >
                        {t.is_team_thread ? <Users className="h-5 w-5" /> : initials(t.title)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-sm font-semibold text-nexus-blue-950">
                            {t.title}
                          </h3>
                          <span className="flex-shrink-0 text-xs text-slate-400">
                            {formatTime(t.last_message_at)}
                          </span>
                        </div>
                        <p className="truncate text-xs text-slate-500">{t.subtitle}</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-slate-600">
                            {t.last_message}
                          </p>
                          {t.unread_count > 0 && (
                            <span className="inline-flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-nexus-orange-500 px-1.5 text-[10px] font-bold text-white">
                              {t.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* ─── Conversation pane ───────────────────────────────────── */}
      <section className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        {!selectedThread ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Sélectionnez une conversation pour commencer.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                  selectedThread.is_team_thread
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gradient-to-br from-nexus-orange-100 to-nexus-orange-200 text-nexus-orange-700"
                )}
              >
                {selectedThread.is_team_thread ? (
                  <Users className="h-5 w-5" />
                ) : (
                  initials(selectedThread.title)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-base font-semibold text-nexus-blue-950">
                  {selectedThread.title}
                </h2>
                <p className="truncate text-xs text-slate-500">
                  {selectedThread.subtitle} ·{" "}
                  <span className="text-slate-400">
                    {selectedThread.participants.join(", ")}
                  </span>
                </p>
              </div>
              {selectedThread.is_team_thread && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                  <Users className="h-3 w-3" />
                  Équipe
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/40 p-5">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Aucun message. Démarrez la conversation.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.author === currentUser;
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex gap-3",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                          {initials(m.author)}
                        </div>
                      )}
                      <div className={cn("max-w-[70%]", isMe && "items-end")}>
                        <div
                          className={cn(
                            "mb-1 flex items-center gap-2 text-xs",
                            isMe && "justify-end"
                          )}
                        >
                          <span className="font-semibold text-nexus-blue-950">
                            {isMe ? "Vous" : m.author}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium",
                              ROLE_BADGE[m.author_role]
                            )}
                          >
                            {ROLE_LABEL[m.author_role]}
                          </span>
                          <span className="text-slate-400">
                            {formatFullTime(m.created_at)}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                            isMe
                              ? "rounded-tr-sm bg-nexus-orange-500 text-white"
                              : "rounded-tl-sm border border-slate-200 bg-white text-slate-800"
                          )}
                        >
                          {m.body}
                        </div>
                        {isMe && (
                          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                            <CheckCheck className="h-3 w-3" />
                            Envoyé
                          </div>
                        )}
                      </div>
                      {isMe && (
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-nexus-orange-100 text-xs font-semibold text-nexus-orange-700">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-nexus-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-nexus-orange-100">
                <button
                  type="button"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="Joindre un fichier"
                  onClick={() => toast("Pièces jointes — bientôt disponible", { icon: "📎" })}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Écrivez votre message…  (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
                  className="flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0"
                  style={{ maxHeight: 120 }}
                />
                <button
                  type="button"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="Emoji"
                  onClick={() => toast("Emojis — bientôt disponible", { icon: "😊" })}
                >
                  <Smile className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim() || sending}
                  className="flex h-9 items-center gap-1.5 rounded-lg bg-nexus-orange-500 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Send className="h-4 w-4" />
                  Envoyer
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Module de messagerie — données mockées. La table{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">messages</code>{" "}
                sera créée dans une migration ultérieure.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Inbox,
  FolderOpen,
  Wallet,
  Users,
  RefreshCw,
  Download,
  LayoutDashboard,
  FileText,
  CalendarCheck,
  Sparkles,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { Profile } from "@/types";
import type { AdminNavGroup } from "@/lib/admin-nav";
import type { ATraiterCounters, PipelineCount, Aujourdhui, Alerte, ActiviteRecente } from "@/lib/dashboard-blocks";
import {
  AdminShell,
  AdminToaster,
  toast,
  Breadcrumb,
  PageHeader,
  SidebarGroup,
  SidebarItem,
  GlobalSearch,
  type GlobalSearchResult,
  NotificationCenter,
  type NotificationItem,
  UserMenu,
  StatusBadge,
  type StatusTone,
  PriorityBadge,
  type PriorityLevel,
  Avatar,
  Skeleton,
  EmptyState,
  ErrorState,
  StatCard,
  Timeline,
  type TimelineItem,
  Tooltip,
  Alert,
  Modal,
  SlideOver,
  ConfirmDialog,
  Field,
  Input,
  Textarea,
  Select,
  DatePicker,
  FormSection,
  UnsavedChangesGuard,
  FormStepper,
  type FormStep,
  FileDrop,
  Combobox,
  type ComboboxOption,
  Pagination,
  BulkActionBar,
  FilterBar,
  ColumnPicker,
  type ColumnOption,
  ExportButton,
  SavedViews,
  type SavedView,
  DataTable,
  type DataTableColumn,
  DataCardList,
} from "@/components/admin/ui";

const STATUS_TONES: StatusTone[] = [
  "neutral",
  "waiting",
  "progress",
  "success",
  "failure",
  "inert",
];

const STATUS_LABELS: Record<StatusTone, string> = {
  neutral: "Nouveau",
  waiting: "En attente",
  progress: "En cours",
  success: "Terminé",
  failure: "Rejeté",
  inert: "Archivé",
};

const PRIORITY_LEVELS: PriorityLevel[] = ["low", "normal", "high", "urgent"];

const TIMELINE_ITEMS: TimelineItem[] = [
  { id: "1", label: "Dossier créé", timestamp: "12/08 09:14", tone: "neutral" },
  { id: "2", label: "Documents reçus", description: "Passeport + photo", timestamp: "13/08 11:02", tone: "progress" },
  { id: "3", label: "Envoyé au consulat", timestamp: "15/08 16:40", tone: "waiting" },
  { id: "4", label: "Visa délivré", timestamp: "22/08 10:05", tone: "success" },
];

interface DemoRow {
  id: string;
  client: string;
  type: string;
  status: StatusTone;
  priority: PriorityLevel;
  amount: number;
  date: string;
}

const DEMO_ROWS: DemoRow[] = [
  { id: "1", client: "Marie Yatola", type: "Visa Schengen", status: "progress", priority: "high", amount: 85000, date: "2026-08-12" },
  { id: "2", client: "Jean Ngakola", type: "Billet + Hôtel", status: "success", priority: "normal", amount: 420000, date: "2026-08-14" },
  { id: "3", client: "Fatima Bozizé", type: "Visa e-Visa", status: "waiting", priority: "urgent", amount: 65000, date: "2026-08-15" },
  { id: "4", client: "Paul Ouandji", type: "Incubateur", status: "neutral", priority: "low", amount: 0, date: "2026-08-16" },
  { id: "5", client: "Sarah Koyt", type: "Visa Schengen", status: "failure", priority: "normal", amount: 85000, date: "2026-08-17" },
];

const COLUMN_OPTIONS: ColumnOption[] = [
  { key: "client", label: "Client" },
  { key: "type", label: "Type" },
  { key: "status", label: "Statut" },
  { key: "priority", label: "Priorité" },
  { key: "amount", label: "Montant" },
  { key: "date", label: "Date" },
];

const SAVED_VIEWS: SavedView[] = [
  { id: "all", label: "Toutes", count: 12 },
  { id: "mine", label: "Mes dossiers", count: 5 },
  { id: "urgent", label: "Urgentes", count: 2 },
];

const NOTIFICATIONS: NotificationItem[] = [
  { id: "1", title: "Nouveau dossier assigné", description: "Marie Yatola — Visa Schengen", timestamp: "il y a 5 min", tone: "progress", read: false },
  { id: "2", title: "Paiement confirmé", description: "420 000 FCFA — Jean Ngakola", timestamp: "il y a 2 h", tone: "success", read: false },
  { id: "3", title: "RDV annulé", timestamp: "hier", tone: "failure", read: true },
];

const AGENT_OPTIONS: ComboboxOption[] = [
  { value: "agent-1", label: "Marie Yatola" },
  { value: "agent-2", label: "Jean Ngakola" },
  { value: "agent-3", label: "Fatima Bozizé" },
];

const FORM_STEPS: FormStep[] = [
  { id: "infos", label: "Informations" },
  { id: "documents", label: "Documents" },
  { id: "recap", label: "Récapitulatif" },
];

const PAGE_SIZE = 5;

interface DemandeRow {
  id: string;
  reference: string | null;
  nom_complet: string;
  statut: string;
  urgence: string;
  traitement_prioritaire: boolean;
  deadline: string | null;
  agent_id: string | null;
  created_at: string;
}

const TERMINAL_STATUTS = ["termine", "refuse", "annule", "archive", "complete"];

/** Copie locale de lib/dashboard-blocks.ts (server-only, non importable ici
 * sans faire fuiter next/headers dans le bundle client) — même logique. */
function dernierEvenementLabel(activite: ActiviteRecente[]): string {
  if (activite.length === 0) return "Aucune activité enregistrée pour l'instant.";
  return `Rien depuis le ${new Date(activite[0].createdAt).toLocaleDateString("fr-FR")}`;
}

export function DesignSystemShowcase({
  profile,
  effectiveNav,
  demandes,
  aTraiter,
  pipeline,
  aujourdhui,
  alertes,
}: {
  profile: Profile;
  effectiveNav: AdminNavGroup[];
  demandes: DemandeRow[];
  aTraiter: ATraiterCounters;
  pipeline: PipelineCount[];
  aujourdhui: Aujourdhui;
  alertes: Alerte[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [visibleKeys, setVisibleKeys] = useState(COLUMN_OPTIONS.map((c) => c.key));
  const [activeView, setActiveView] = useState("all");
  const [tableSearch, setTableSearch] = useState("");
  const [page, setPage] = useState(1);

  const [globalSearchValue, setGlobalSearchValue] = useState("");
  const [comboboxValue, setComboboxValue] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [currentStepId, setCurrentStepId] = useState(FORM_STEPS[0].id);
  const [droppedFiles, setDroppedFiles] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDestructiveOpen, setConfirmDestructiveOpen] = useState(false);

  // A3 — module Dossiers unique, vues enregistrées sur donnees reelles.
  const [dossierView, setDossierView] = useState("boite-reception");

  const dossierViews = useMemo<(SavedView & { rows: DemandeRow[] })[]>(() => {
    const now = Date.now();
    const boiteReception = demandes.filter(
      (d) => d.statut === "nouvelle_demande" && !d.agent_id
    );
    const mesDossiers = demandes.filter((d) => d.agent_id === profile.id);
    const actifs = demandes.filter((d) => !TERMINAL_STATUTS.includes(d.statut));
    const urgents = actifs.filter(
      (d) => d.urgence === "critique" || d.traitement_prioritaire
    );
    const enRetard = actifs.filter(
      (d) => d.deadline && new Date(d.deadline).getTime() < now
    );
    const termines = demandes.filter((d) => d.statut === "termine" || d.statut === "complete");
    const archives = demandes.filter((d) => d.statut === "archive");

    return [
      { id: "boite-reception", label: "Boîte de réception", count: boiteReception.length, rows: boiteReception },
      { id: "mes-dossiers", label: "Mes dossiers", count: mesDossiers.length, rows: mesDossiers },
      { id: "actifs", label: "Actifs", count: actifs.length, rows: actifs },
      { id: "urgents", label: "Urgents", count: urgents.length, rows: urgents },
      { id: "en-retard", label: "En retard", count: enRetard.length, rows: enRetard },
      { id: "termines", label: "Terminés", count: termines.length, rows: termines },
      { id: "archives", label: "Archivés", count: archives.length, rows: archives },
    ];
  }, [demandes, profile.id]);

  const activeDossierRows = dossierViews.find((v) => v.id === dossierView)?.rows ?? [];

  const dossierColumns: DataTableColumn<DemandeRow>[] = [
    { key: "reference", header: "Référence", render: (r) => r.reference ?? "—" },
    { key: "nom_complet", header: "Client", render: (r) => r.nom_complet },
    {
      key: "statut",
      header: "Statut",
      render: (r) => <StatusBadge tone="progress" label={r.statut} />,
    },
    {
      key: "urgence",
      header: "Urgence",
      render: (r) => (
        <PriorityBadge
          level={
            r.urgence === "critique"
              ? "urgent"
              : r.urgence === "elevee"
                ? "high"
                : r.urgence === "faible"
                  ? "low"
                  : "normal"
          }
        />
      ),
    },
    { key: "created_at", header: "Créé le", align: "right", render: (r) => new Date(r.created_at).toLocaleDateString("fr-FR") },
  ];

  const globalSearchResults = useMemo<GlobalSearchResult[]>(() => {
    if (!globalSearchValue) return [];
    return DEMO_ROWS.filter((r) =>
      r.client.toLowerCase().includes(globalSearchValue.toLowerCase())
    ).map((r) => ({
      id: r.id,
      title: r.client,
      subtitle: r.type,
      category: "Dossier",
      href: "#",
    }));
  }, [globalSearchValue]);

  const sortedRows = useMemo(() => {
    const filtered = DEMO_ROWS.filter((r) =>
      r.client.toLowerCase().includes(tableSearch.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => {
      const va = a[sortKey as keyof DemoRow];
      const vb = b[sortKey as keyof DemoRow];
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [tableSearch, sortKey, sortDirection]);

  const allColumns: DataTableColumn<DemoRow>[] = [
    { key: "client", header: "Client", render: (r) => r.client, sortable: true },
    { key: "type", header: "Type", render: (r) => r.type, sortable: true },
    {
      key: "status",
      header: "Statut",
      render: (r) => <StatusBadge tone={r.status} label={STATUS_LABELS[r.status]} />,
    },
    {
      key: "priority",
      header: "Priorité",
      render: (r) => <PriorityBadge level={r.priority} />,
    },
    {
      key: "amount",
      header: "Montant",
      align: "right",
      sortable: true,
      render: (r) => (r.amount > 0 ? `${r.amount.toLocaleString("fr-FR")} FCFA` : "—"),
    },
    { key: "date", header: "Date", align: "right", sortable: true, render: (r) => r.date },
  ];
  const columns = allColumns.filter((c) => visibleKeys.includes(c.key));

  return (
    <>
      <AdminToaster />
      <AdminShell
        sidebarHeader={
          <p className="font-display text-title font-bold text-ink">Nexus Admin UI</p>
        }
        sidebarContent={
          <>
            <SidebarGroup label="Vitrine">
              <SidebarItem icon={<LayoutDashboard />} label="Affichage" href="#affichage" />
              <SidebarItem icon={<Sparkles />} label="Retour" href="#retour" />
              <SidebarItem icon={<FileText />} label="Saisie" href="#saisie" />
              <SidebarItem icon={<Wallet />} label="Données" href="#donnees" active />
              <SidebarItem icon={<Users />} label="Structure" href="#structure" />
            </SidebarGroup>
            <SidebarGroup label="Exemple de badge">
              <SidebarItem icon={<CalendarCheck />} label="Dossiers urgents" href="#" badge={<PriorityBadge level="urgent" />} />
            </SidebarGroup>
          </>
        }
        sidebarFooter={
          <SidebarItem icon={<Settings />} label="Retour au site" href="/" />
        }
        topbarCenter={
          <GlobalSearch
            value={globalSearchValue}
            onValueChange={setGlobalSearchValue}
            results={globalSearchResults}
            onSelect={() => setGlobalSearchValue("")}
          />
        }
        topbarRight={
          <>
            <NotificationCenter
              notifications={NOTIFICATIONS}
              onMarkAllRead={() => toast.success("Notifications marquées comme lues")}
            />
            <UserMenu
              name={`${profile.prenom} ${profile.nom}`}
              email={profile.email}
              onSettings={() => toast("Paramètres (démo)")}
              onLogout={() => toast("Déconnexion (démo)")}
            />
          </>
        }
      >
        <PageHeader
          breadcrumb={<Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Design System" }]} />}
          title="Design System — Admin"
          description="Vitrine interne des 40 composants de la Phase A2. Page réservée super_admin, à retirer en P12."
        />

        <div className="mt-8 space-y-14">
          {/* AFFICHAGE */}
          <section id="affichage" className="scroll-mt-20 space-y-6">
            <h2 className="font-display text-xl font-bold text-ink">Affichage</h2>

            <div className="flex flex-wrap gap-2">
              {STATUS_TONES.map((tone) => (
                <StatusBadge key={tone} tone={tone} label={STATUS_LABELS[tone]} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_LEVELS.map((level) => (
                <PriorityBadge key={level} level={level} />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Avatar name="Marie Yatola" size="sm" />
              <Avatar name="Jean Ngakola" size="md" />
              <Avatar name="Fatima Bozizé" size="lg" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <EmptyState
                icon={Inbox}
                title="Aucun dossier"
                description="Aucun dossier ne correspond à ces filtres pour le moment."
                action={
                  <button className="rounded-xs bg-brand px-4 py-2 text-body-sm font-semibold text-white hover:bg-brand-hover">
                    Créer un dossier
                  </button>
                }
              />
              <ErrorState
                title="Chargement impossible"
                description="La connexion à Supabase a échoué. Réessayez dans quelques instants."
                action={
                  <button className="flex items-center gap-1.5 rounded-xs border border-line px-4 py-2 text-body-sm font-medium text-ink hover:bg-surface-sunken">
                    <RefreshCw className="h-4 w-4" /> Réessayer
                  </button>
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Dossiers actifs" value={12} icon={FolderOpen} />
              <StatCard label="Encaissé ce mois" value="4 250 000 FCFA" icon={Wallet} />
              <StatCard label="Clients" value={87} icon={Users} />
            </div>

            <div className="max-w-md rounded-sm border border-line bg-surface-elevated p-4">
              <Timeline items={TIMELINE_ITEMS} />
            </div>
          </section>

          {/* RETOUR */}
          <section id="retour" className="scroll-mt-20 space-y-6">
            <h2 className="font-display text-xl font-bold text-ink">Retour</h2>

            <Tooltip content="Information contextuelle au survol">
              <button className="rounded-xs border border-line px-4 py-2 text-body-sm font-medium text-ink hover:bg-surface-sunken">
                Survolez-moi
              </button>
            </Tooltip>

            <div className="space-y-3">
              <Alert tone="info" title="Information">Ce dossier a été mis à jour il y a 2 heures.</Alert>
              <Alert tone="success" title="Succès">Le paiement a été confirmé.</Alert>
              <Alert tone="warning" title="Attention">Le passeport expire dans moins de 6 mois.</Alert>
              <Alert tone="error" title="Erreur">Impossible d&apos;envoyer l&apos;email de confirmation.</Alert>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setModalOpen(true)}
                className="rounded-xs border border-line px-4 py-2 text-body-sm font-medium text-ink hover:bg-surface-sunken"
              >
                Ouvrir Modal
              </button>
              <button
                onClick={() => setSlideOverOpen(true)}
                className="rounded-xs border border-line px-4 py-2 text-body-sm font-medium text-ink hover:bg-surface-sunken"
              >
                Ouvrir SlideOver
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="rounded-xs border border-line px-4 py-2 text-body-sm font-medium text-ink hover:bg-surface-sunken"
              >
                Confirmation simple
              </button>
              <button
                onClick={() => setConfirmDestructiveOpen(true)}
                className="rounded-xs border border-status-failure/40 px-4 py-2 text-body-sm font-medium text-status-failure hover:bg-status-failure/10"
              >
                Confirmation destructive
              </button>
              <button
                onClick={() => toast.success("Opération réussie")}
                className="rounded-xs border border-line px-4 py-2 text-body-sm font-medium text-ink hover:bg-surface-sunken"
              >
                Toast succès
              </button>
              <button
                onClick={() => toast.error("Une erreur est survenue")}
                className="rounded-xs border border-line px-4 py-2 text-body-sm font-medium text-ink hover:bg-surface-sunken"
              >
                Toast erreur
              </button>
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Détail du dossier">
              <p className="text-body-sm text-ink-muted">Contenu de démonstration du Modal.</p>
            </Modal>
            <SlideOver open={slideOverOpen} onClose={() => setSlideOverOpen(false)} title="Détail rapide">
              <p className="text-body-sm text-ink-muted">Contenu de démonstration du SlideOver.</p>
            </SlideOver>
            <ConfirmDialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={() => {
                setConfirmOpen(false);
                toast.success("Action confirmée");
              }}
              title="Confirmer l'action"
              description="Voulez-vous vraiment continuer ?"
            />
            <ConfirmDialog
              open={confirmDestructiveOpen}
              onClose={() => setConfirmDestructiveOpen(false)}
              onConfirm={() => {
                setConfirmDestructiveOpen(false);
                toast.success("Dossier supprimé (démo)");
              }}
              title="Supprimer le dossier"
              description="Cette action est irréversible."
              destructive
              confirmLabel="Supprimer"
              confirmationText="SUPPRIMER"
            />
          </section>

          {/* SAISIE */}
          <section id="saisie" className="scroll-mt-20 space-y-6">
            <h2 className="font-display text-xl font-bold text-ink">Saisie</h2>

            <FormSection title="Informations client" description="Champs de formulaire standards.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom complet" required>
                  <Input placeholder="Marie Yatola" />
                </Field>
                <Field label="Statut">
                  <Select defaultValue="waiting">
                    {STATUS_TONES.map((tone) => (
                      <option key={tone} value={tone}>
                        {STATUS_LABELS[tone]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Date de rendez-vous">
                  <DatePicker />
                </Field>
                <Field label="Agent assigné" hint="Recherche parmi les agents actifs">
                  <Combobox options={AGENT_OPTIONS} value={comboboxValue} onChange={setComboboxValue} />
                </Field>
              </div>
              <Field label="Notes" className="mt-4">
                <Textarea placeholder="Notes internes sur le dossier…" />
              </Field>
            </FormSection>

            <div>
              <p className="mb-2 text-body-sm font-medium text-ink">Import de documents</p>
              <FileDrop onFiles={(files) => setDroppedFiles(files.map((f) => f.name))} hint="PDF, JPG — 10 Mo max" />
              {droppedFiles.length > 0 && (
                <ul className="mt-2 text-body-sm text-ink-muted">
                  {droppedFiles.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-2 text-body-sm font-medium text-ink">Étapes du formulaire</p>
              <FormStepper steps={FORM_STEPS} currentStepId={currentStepId} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    const i = FORM_STEPS.findIndex((s) => s.id === currentStepId);
                    if (i > 0) setCurrentStepId(FORM_STEPS[i - 1].id);
                  }}
                  className="rounded-xs border border-line px-3 py-1.5 text-body-sm text-ink hover:bg-surface-sunken"
                >
                  Précédent
                </button>
                <button
                  onClick={() => {
                    const i = FORM_STEPS.findIndex((s) => s.id === currentStepId);
                    if (i < FORM_STEPS.length - 1) setCurrentStepId(FORM_STEPS[i + 1].id);
                  }}
                  className="rounded-xs border border-line px-3 py-1.5 text-body-sm text-ink hover:bg-surface-sunken"
                >
                  Suivant
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-body-sm text-ink-muted">
              <input type="checkbox" checked={dirty} onChange={(e) => setDirty(e.target.checked)} />
              Simuler des modifications non enregistrées (essayez de fermer/recharger l&apos;onglet)
            </label>
            <UnsavedChangesGuard hasUnsavedChanges={dirty} />
          </section>

          {/* DONNÉES */}
          <section id="donnees" className="scroll-mt-20 space-y-4">
            <h2 className="font-display text-xl font-bold text-ink">Données</h2>

            <SavedViews views={SAVED_VIEWS} activeId={activeView} onChange={setActiveView} />

            <FilterBar searchValue={tableSearch} onSearchChange={setTableSearch}>
              <ColumnPicker columns={COLUMN_OPTIONS} visibleKeys={visibleKeys} onChange={setVisibleKeys} />
              <ExportButton onExport={() => toast.success("Export CSV lancé (démo)")} />
            </FilterBar>

            <BulkActionBar
              selectedCount={selectedIds.length}
              onClear={() => setSelectedIds([])}
              actions={
                <>
                  <button
                    onClick={() => toast.success(`${selectedIds.length} dossier(s) exporté(s)`)}
                    className="flex items-center gap-1.5 rounded-xs border border-line px-3 py-1.5 text-body-sm text-ink hover:bg-surface-sunken"
                  >
                    <Download className="h-4 w-4" /> Exporter
                  </button>
                </>
              }
            />

            <DataTable
              columns={columns}
              rows={sortedRows}
              getRowId={(r) => r.id}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={(key, direction) => {
                setSortKey(key);
                setSortDirection(direction);
              }}
            />

            <Pagination page={page} pageSize={PAGE_SIZE} total={12} onPageChange={setPage} />

            <div>
              <p className="mb-2 text-body-sm font-medium text-ink">
                Équivalent mobile (DataCardList — jamais de défilement horizontal)
              </p>
              <DataCardList
                items={sortedRows.map((r) => ({
                  id: r.id,
                  title: r.client,
                  fields: [
                    { label: "Type", value: r.type },
                    { label: "Statut", value: <StatusBadge tone={r.status} label={STATUS_LABELS[r.status]} /> },
                    { label: "Priorité", value: <PriorityBadge level={r.priority} /> },
                    { label: "Montant", value: r.amount > 0 ? `${r.amount.toLocaleString("fr-FR")} FCFA` : "—" },
                  ],
                }))}
              />
            </div>
          </section>

          {/* STRUCTURE */}
          <section id="structure" className="scroll-mt-20 space-y-3">
            <h2 className="font-display text-xl font-bold text-ink">Structure</h2>
            <p className="text-body-sm text-ink-muted">
              Breadcrumb et PageHeader sont visibles en haut de cette page. Sidebar, Topbar,
              UserMenu, NotificationCenter, GlobalSearch et AdminShell composent la mise en page
              de cette vitrine elle-même — c&apos;est leur démonstration en conditions réelles.
            </p>
          </section>

          {/* A3 — SHELL D'ADMINISTRATION */}
          <section id="a3-shell" className="scroll-mt-20 space-y-6">
            <h2 className="font-display text-xl font-bold text-ink">
              A3 — Shell d&apos;administration
            </h2>
            <p className="text-body-sm text-ink-muted">
              Navigation calculée côté serveur à partir des permissions effectives de{" "}
              <strong>{profile.prenom} {profile.nom}</strong> ({profile.role}) — pas un rôle
              codé en dur. Un module de vague 2 n&apos;apparaît jamais tant que sa phase backend
              n&apos;est pas livrée (aucun n&apos;est visible ci-dessous, c&apos;est attendu).
            </p>

            <div>
              <p className="mb-2 text-body-sm font-medium text-ink">
                Menu réel pour cette session (getEffectiveNav)
              </p>
              <div className="max-w-xs rounded-sm border border-line bg-surface-elevated p-3">
                {effectiveNav.length === 0 ? (
                  <p className="px-3 py-6 text-center text-body-sm text-ink-subtle">
                    Aucun module de vague 1 autorisé pour ce rôle.
                  </p>
                ) : (
                  effectiveNav.map((group) => (
                    <SidebarGroup key={group.key} label={group.label}>
                      {group.modules.map((m) => (
                        <SidebarItem
                          key={m.key}
                          icon={<FolderOpen />}
                          label={m.label}
                          href={m.href}
                        />
                      ))}
                    </SidebarGroup>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-body-sm font-medium text-ink">
                Module « Dossiers » — vues enregistrées, un seul module (pas « demandes reçues »
                + « dossiers clients »)
              </p>
              <SavedViews
                views={dossierViews}
                activeId={dossierView}
                onChange={setDossierView}
                className="mb-3"
              />
              {activeDossierRows.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="Aucun dossier dans cette vue"
                  description="Chiffre honnête : une vue vide s'affiche vide, jamais un zéro inventé."
                />
              ) : (
                <DataTable
                  columns={dossierColumns}
                  rows={activeDossierRows}
                  getRowId={(r) => r.id}
                />
              )}
            </div>

            <p className="text-caption text-ink-subtle">
              Construction isolée (A3) — aucune page réelle ne consomme encore ce mécanisme ;
              DashboardShell reste la navigation en production jusqu&apos;à bascule section par
              section (A4-A7).
            </p>
          </section>

          {/* A4 — TABLEAU DE BORD */}
          <section id="a4-dashboard" className="scroll-mt-20 space-y-6">
            <h2 className="font-display text-xl font-bold text-ink">
              A4 — Tableau de bord
            </h2>
            <p className="text-body-sm text-ink-muted">
              Quatre blocs, chacun sur une requête réelle citée dans{" "}
              <code className="font-mono text-caption">lib/dashboard-blocks.ts</code>. Aucun bloc
              financier (décision D1), aucune variation en %, aucun score inventé.
            </p>

            {/* Bloc 1 : À traiter */}
            <div>
              <p className="mb-2 text-body-sm font-medium text-ink">1. À traiter</p>
              {aTraiter.nouvelles + aTraiter.attenteClient + aTraiter.enTraitement + aTraiter.enRetard === 0 ? (
                <EmptyState icon={Inbox} title="Aucun dossier ne demande d'action aujourd'hui." />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Nouvelles" value={aTraiter.nouvelles} icon={Inbox} href="#" />
                  <StatCard label="Attente client" value={aTraiter.attenteClient} icon={FileText} href="#" />
                  <StatCard label="En traitement" value={aTraiter.enTraitement} icon={FolderOpen} href="#" />
                  <StatCard label="En retard" value={aTraiter.enRetard} icon={CalendarCheck} href="#" />
                </div>
              )}
            </div>

            {/* Bloc 2 : Pipeline */}
            <div>
              <p className="mb-2 text-body-sm font-medium text-ink">
                2. Pipeline — répartition réelle par statut, 0 inclus (l&apos;information utile)
              </p>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {pipeline.map((p) => (
                  <div key={p.statut} className="rounded-sm border border-line bg-surface-elevated p-3">
                    <p className="text-caption text-ink-subtle">{p.statut}</p>
                    <p className="font-display text-display-sm text-ink [font-variant-numeric:tabular-nums]">{p.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloc 3 : Aujourd'hui */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-body-sm font-medium text-ink">3. Aujourd&apos;hui — rendez-vous</p>
                {aujourdhui.rdvDuJour.length === 0 ? (
                  <EmptyState icon={CalendarCheck} title="Aucun rendez-vous aujourd'hui." />
                ) : (
                  <ul className="space-y-2">
                    {aujourdhui.rdvDuJour.map((r) => (
                      <li key={r.id} className="rounded-sm border border-line bg-surface-elevated p-3 text-body-sm">
                        {r.rdv_heure} — {r.client_nom} <StatusBadge tone="progress" label={r.statut} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="mb-2 text-body-sm font-medium text-ink">Activité récente</p>
                {aujourdhui.activiteRecente.length === 0 ? (
                  <EmptyState icon={FileText} title={dernierEvenementLabel(aujourdhui.activiteRecente)} />
                ) : (
                  <div className="rounded-sm border border-line bg-surface-elevated p-4">
                    <Timeline
                      items={aujourdhui.activiteRecente.map<TimelineItem>((a) => ({
                        id: a.id,
                        label: a.label,
                        timestamp: new Date(a.createdAt).toLocaleString("fr-FR"),
                        tone: a.type === "paiement" ? "success" : a.type === "statut" ? "progress" : "neutral",
                      }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bloc 4 : Alertes */}
            <div>
              <p className="mb-2 text-body-sm font-medium text-ink">
                4. Alertes — 3 faits vérifiables (« documents rejetés » retirée, voir
                lib/dashboard-blocks.ts : aucune donnée ne peut la produire)
              </p>
              {alertes.every((a) => a.count === 0) ? (
                <EmptyState icon={ShieldCheck} title="Aucune alerte." />
              ) : (
                <div className="space-y-2">
                  {alertes
                    .filter((a) => a.count > 0)
                    .map((a) => (
                      <Alert key={a.key} tone="warning" title={a.label}>
                        {a.count} dossier{a.count > 1 ? "s" : ""} concerné{a.count > 1 ? "s" : ""}
                      </Alert>
                    ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </AdminShell>
    </>
  );
}

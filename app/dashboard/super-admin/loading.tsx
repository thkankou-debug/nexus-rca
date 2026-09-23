export default function SuperAdminLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <p className="text-sm font-semibold text-[#8b93a7]">Chargement de la rubrique…</p>
      <div className="h-36 animate-pulse rounded-2xl border border-[#eceef6] bg-white" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-28 animate-pulse rounded-2xl border border-[#eceef6] bg-white" />
        <div className="h-28 animate-pulse rounded-2xl border border-[#eceef6] bg-white" />
        <div className="h-28 animate-pulse rounded-2xl border border-[#eceef6] bg-white" />
        <div className="h-28 animate-pulse rounded-2xl border border-[#eceef6] bg-white" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-[#eceef6] bg-white" />
    </div>
  );
}

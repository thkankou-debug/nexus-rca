"use client";

export default function SuperAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#eceef6] bg-white p-6">
      <h1 className="text-lg font-bold text-[#1c2033]">{"Cette rubrique ne s'est pas chargée"}</h1>
      <p className="mt-2 text-sm text-[#8b93a7]">
        {error.message || "Erreur inattendue. Aucun chiffre de remplacement."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 h-10 rounded-xl bg-[#7c5cfc] px-4 text-sm font-semibold text-white"
      >
        Réessayer
      </button>
    </div>
  );
}

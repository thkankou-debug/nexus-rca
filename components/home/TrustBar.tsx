import { useTranslations } from "next-intl";
import { FileText, Lock, UserRound, type LucideIcon } from "lucide-react";

// ─── TrustBar — bandeau 3 colonnes sous le hero (structure maquette P10) ───

interface TrustItem {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const ITEMS: TrustItem[] = [
  { icon: Lock, titleKey: "item1_title", descKey: "item1_desc" },
  { icon: FileText, titleKey: "item2_title", descKey: "item2_desc" },
  { icon: UserRound, titleKey: "item3_title", descKey: "item3_desc" },
];

export function TrustBar() {
  const t = useTranslations("TrustBar");

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.titleKey}
                className="flex items-start gap-4 py-5 sm:px-6 sm:py-0 first:sm:pl-0"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-nexus-blue-900">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-nexus-blue-950">
                    {t(item.titleKey)}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {t(item.descKey)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

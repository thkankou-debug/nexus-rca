import { requireProfile } from "@/lib/auth";

// Le cadre est celui du layout parent. Ici, seulement la garde super_admin.
export default async function RhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProfile(["super_admin"]);
  return children;
}

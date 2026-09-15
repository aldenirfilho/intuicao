import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { EccPanel } from "@/components/ecc-panel";

export const Route = createFileRoute("/cifra")({ component: CifraPage });

function CifraPage() {
  return (
    <AppShell active="cifra">
      <EccPanel />
    </AppShell>
  );
}

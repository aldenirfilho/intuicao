import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { CcvPanel } from "@/components/ccv-panel";

export const Route = createFileRoute("/ccv")({ component: CcvPage });

function CcvPage() {
  return (
    <AppShell active="ccv">
      <CcvPanel />
    </AppShell>
  );
}

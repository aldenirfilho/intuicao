import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { TriPanel } from "@/components/tri-panel";

export const Route = createFileRoute("/tri")({ component: TriPage });

function TriPage() {
  return (
    <AppShell active="tri">
      <TriPanel />
    </AppShell>
  );
}

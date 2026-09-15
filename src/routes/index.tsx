import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Simulator } from "@/components/simulator";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <AppShell active="lab">
      <Simulator />
    </AppShell>
  );
}

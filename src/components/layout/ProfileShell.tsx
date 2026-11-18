"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/Loader";
import { useProfile } from "@/state/ProfileContext";
import { AppShell } from "./AppShell";

/**
 * Protege as telas internas: sem perfil escolhido, volta para a
 * Seleção de perfil. Com perfil, exibe a estrutura padrão (AppShell).
 */
export function ProfileShell({ children }: { children: ReactNode }) {
  const { profile, ready } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (ready && !profile) router.replace("/");
  }, [ready, profile, router]);

  if (!ready || !profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader label={ready ? "Redirecionando para a seleção de perfil…" : "Carregando…"} />
      </div>
    );
  }

  return (
    <AppShell profileLabel={profile.label} switchProfileHref="/">
      {children}
    </AppShell>
  );
}

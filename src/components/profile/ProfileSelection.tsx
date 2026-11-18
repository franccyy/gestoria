"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { PROFILES } from "@/lib/profiles";
import { useConversation } from "@/state/ConversationContext";
import { useProfile } from "@/state/ProfileContext";
import type { ProfileId } from "@/types/profile";
import { ProfileOption } from "./ProfileOption";

/** Tela 1 — escolha do perfil para explorar o protótipo. */
export function ProfileSelection() {
  const router = useRouter();
  const { profile, ready, selectProfile } = useProfile();
  const { clear } = useConversation();
  const [selected, setSelected] = useState<ProfileId | null>(null);

  // Ao voltar por "Trocar perfil", o perfil atual já vem marcado.
  useEffect(() => {
    if (ready && profile) setSelected(profile.id);
  }, [ready, profile]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    // Outra pessoa/perfil: começa uma conversa nova.
    if (profile && profile.id !== selected) clear();
    selectProfile(selected);
    router.push("/inicio");
  }

  return (
    <main className="min-h-dvh sm:py-6">
      <div className="mx-auto flex min-h-dvh max-w-app flex-col bg-background px-page py-section sm:min-h-0 sm:rounded-lg sm:shadow-app">
        <Logo />

        <p className="mt-10 text-caption uppercase tracking-eyebrow text-muted">Protótipo · Varejo</p>
        <h1 className="mt-3 text-display font-semibold">Sua loja mais inteligente.</h1>
        <p className="mt-3 text-lead text-muted">
          Informação certa, na hora certa. Consulte produtos, estoque e vendas em linguagem natural.
        </p>

        <form onSubmit={handleSubmit} className="mt-section">
          <fieldset>
            <legend className="text-xl font-medium font-serif text-foreground">Escolha um perfil</legend>
            <p className="mt-1 text-body text-muted">Cada perfil vê as informações adequadas à sua função.</p>
            <div className="mt-4 flex flex-col gap-3">
              {PROFILES.map((item) => (
                <ProfileOption
                  key={item.id}
                  name="profile"
                  profile={item}
                  selected={selected === item.id}
                  onSelect={() => setSelected(item.id)}
                />
              ))}
            </div>
          </fieldset>

          <Button type="submit" fullWidth iconRight="arrowUpRight" disabled={!selected} className="mt-6">
            Explorar protótipo
          </Button>
          {!selected && <p className="mt-2 text-center text-caption text-muted">Selecione um perfil para continuar.</p>}
        </form>

        <Alert tone="info" className="mt-section">
          Todos os dados são fictícios. Este protótipo não tem conexão com sistemas da empresa (ERP).
        </Alert>
      </div>
    </main>
  );
}

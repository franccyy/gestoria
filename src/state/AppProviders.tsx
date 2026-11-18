"use client";

import type { ReactNode } from "react";
import { ConversationProvider } from "./ConversationContext";
import { ProfileProvider } from "./ProfileContext";

/** Reúne todos os estados globais do app em um só lugar. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <ConversationProvider>{children}</ConversationProvider>
    </ProfileProvider>
  );
}

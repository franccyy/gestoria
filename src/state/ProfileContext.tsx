"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { findProfile, isProfileId } from "@/lib/profiles";
import { readSession, removeSession, writeSession } from "@/lib/sessionStore";
import type { Profile, ProfileId } from "@/types/profile";

interface ProfileContextValue {
  /** Perfil escolhido, ou null se ainda não escolheu. */
  profile: Profile | null;
  /** false enquanto o perfil salvo na sessão ainda está sendo lido. */
  ready: boolean;
  selectProfile: (id: ProfileId) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);
const STORAGE_KEY = "profile";

/** Guarda o perfil escolhido durante a sessão (até fechar a aba). */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedId = readSession(STORAGE_KEY, isProfileId);
    setProfile(findProfile(savedId) ?? null);
    setReady(true);
  }, []);

  const selectProfile = useCallback((id: ProfileId) => {
    setProfile(findProfile(id) ?? null);
    writeSession(STORAGE_KEY, id);
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    removeSession(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ profile, ready, selectProfile, clearProfile }),
    [profile, ready, selectProfile, clearProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile deve ser usado dentro de <ProfileProvider>.");
  return context;
}

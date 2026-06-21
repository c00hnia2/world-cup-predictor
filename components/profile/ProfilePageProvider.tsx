"use client";

import { createContext, useContext } from "react";

interface ProfilePageContextValue {
  username: string | null;
  displayName: string;
}

const ProfilePageContext = createContext<ProfilePageContextValue | null>(null);

export function ProfilePageProvider({
  username,
  displayName,
  children,
}: ProfilePageContextValue & { children: React.ReactNode }) {
  return (
    <ProfilePageContext.Provider value={{ username, displayName }}>
      {children}
    </ProfilePageContext.Provider>
  );
}

export function useProfilePageContext() {
  return useContext(ProfilePageContext);
}

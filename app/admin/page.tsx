"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/lib/firebase-config";
import LoadingSpinner from "@/app/lib/components/LoadingSpinner";

export default function Admin() {
  const [user, loading, error] = useAuthState(auth);

  return (
    <>
      {error && <p>Fehler beim Laden des Nutzers: {error?.message}</p>}
      {loading && <LoadingSpinner>Lade Nutzer...</LoadingSpinner>}
      {!loading && user && <p>Angemeldet mit {user?.email}</p>}
    </>
  );
}

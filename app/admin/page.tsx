"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/lib/firebase-config";
import LoadingSpinner from "@/app/lib/components/LoadingSpinner";
import ErrorIndicator from "@/app/lib/components/ErrorIndicator";
import EinsendungenComponent from "../lib/components/EinsendungenComponent";

export default function Admin() {
  const [user, loading, error] = useAuthState(auth);

  return (
    <>
      {error && (
        <ErrorIndicator error={error}>
          <p>Fehler beim Laden des Nutzers</p>
        </ErrorIndicator>
      )}
      {loading && <LoadingSpinner>Lade Nutzer...</LoadingSpinner>}
      {!loading && user && <p>Angemeldet mit {user?.email}</p>}

      <EinsendungenComponent />
    </>
  );
}

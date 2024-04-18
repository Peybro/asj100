"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase-config";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorIndicator from "@/components/ErrorIndicator";
import EinsendungenComponent from "@/components/EinsendungenComponent";

export default function Admin() {
  const [user, userLoading, userError] = useAuthState(auth);

  return (
    <>
      {userError && (
        <ErrorIndicator error={userError}>
          <p>Fehler beim Laden des Nutzers</p>
        </ErrorIndicator>
      )}
      {userLoading && <LoadingSpinner>Lade Nutzer...</LoadingSpinner>}
      {!userLoading && user && <p>Angemeldet mit {user?.email}</p>}

      <EinsendungenComponent />
    </>
  );
}

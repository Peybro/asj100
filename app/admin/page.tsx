"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/lib/firebase-config";
import LoadingSpinner from "@/app/lib/components/LoadingSpinner";
import ErrorIndicator from "@/app/lib/components/ErrorIndicator";
import EinsendungenComponent from "../lib/components/EinsendungenComponent";

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

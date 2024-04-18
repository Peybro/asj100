"use client";

import { doc } from "firebase/firestore";
import { useState } from "react";
import { useDocumentOnce } from "react-firebase-hooks/firestore";
import { db } from "@/firebase-config";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import ErrorIndicator from "./ErrorIndicator";
import { Datenschutz } from "@/types/Datenschutz";

type DatenschutzhinweisComponentProps = {
  open: boolean;
  closable?: boolean;
};

/**
 * Displays the privacy policy
 */
export default function DatenschutzhinweisComponent({
  open,
  closable = true,
}: DatenschutzhinweisComponentProps) {
  // Firebase hooks
  const [settingsValue, settingsLoading, settingsError] = useDocumentOnce(
    doc(db, "settings", "settings"),
  );

  // Local state
  const [openState, setOpenState] = useState(open);

  return (
    <>
      <span
        className="text-blue-400 underline"
        onClick={(e) => {
          e.preventDefault();
          setOpenState(true);
        }}
      >
        Datenschutzhinweis
      </span>

      <dialog open={openState}>
        <article>
          <header>
            {closable && (
              <button
                aria-label="Close"
                rel="prev"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenState(false);
                }}
              ></button>
            )}
            <p>
              <strong>Datenschutzhinweis</strong>
            </p>
          </header>
          {settingsError && <ErrorIndicator error={settingsError} />}
          {settingsLoading && (
            <LoadingSpinner>Lade Datenschutzhinweis...</LoadingSpinner>
          )}
          {!settingsLoading && settingsValue && (
            <>
              {settingsValue?.data()!.datenschutzhinweis.length === 0 && (
                <p>Noch keine Datenschutzbestimmungen angegeben...</p>
              )}
              {settingsValue?.data()!.datenschutzhinweis.length > 0 &&
                settingsValue
                  ?.data()!
                  .datenschutzhinweis.map((hinweis: Datenschutz, i: number) => {
                    return (
                      <div key={`hinweis${i}`}>
                        <h4>{hinweis.title}</h4>
                        <p>{hinweis.text}</p>
                      </div>
                    );
                  })}
            </>
          )}
          <footer>
            {closable && (
              <button
                aria-label="Close"
                className="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenState(false);
                }}
              >
                Schließen
              </button>
            )}
            {!closable && (
              <Link href="/" passHref legacyBehavior>
                <a className="text-blue-400 underline">zum Formular</a>
              </Link>
            )}
          </footer>
        </article>
      </dialog>
    </>
  );
}

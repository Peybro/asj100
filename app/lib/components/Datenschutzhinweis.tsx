"use client";

import { doc } from "firebase/firestore";
import { useState } from "react";
import { useDocumentOnce } from "react-firebase-hooks/firestore";
import { db } from "@/app/lib/firebase-config";
import LoadingSpinner from "@/app/lib/components/LoadingSpinner";
import Link from "next/link";
import ErrorIndicator from "./ErrorIndicator";

export default function DatenschutzhinweisComponent({
  open,
  closable = true,
}: {
  open: boolean;
  closable?: boolean;
}) {
  const [openState, setOpenState] = useState(open);

  const [value, loading, error] = useDocumentOnce(
    doc(db, "settings", "settings"),
  );

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

      <dialog open={openState} className="modal-is-opening modal-is-closing">
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
          {error && <ErrorIndicator error={error} />}
          {loading && (
            <LoadingSpinner>Lade Datenschutzhinweis...</LoadingSpinner>
          )}
          {!loading && value && (
            <>
              {value?.data()!.datenschutzhinweis.length === 0 && (
                <p>Noch keine Datenschutzbestimmungen angegeben...</p>
              )}
              {value?.data()!.datenschutzhinweis.length > 0 &&
                value?.data()!.datenschutzhinweis.map((hinweis) => {
                  return (
                    <>
                      <h4>{hinweis.title}</h4>
                      <p>{hinweis.text}</p>
                    </>
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

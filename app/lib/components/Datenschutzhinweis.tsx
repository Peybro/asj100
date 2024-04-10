"use client";

import { doc } from "firebase/firestore";
import { useState } from "react";
import { useDocumentOnce } from "react-firebase-hooks/firestore";
import { db } from "../firebase-config";
import LoadingSpinner from "./LoadingSpinner";

export default function DatenschutzhinweisComponent({
  open,
}: {
  open: boolean;
}) {
  const [openState, setOpenState] = useState(open);

  const [value, loading, error] = useDocumentOnce(
    doc(db, "settings", "settings"),
  );

  return (
    <>
      <span
        className="text-blue-400"
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
            <button
              aria-label="Close"
              rel="prev"
              onClick={(e) => {
                e.preventDefault();
                setOpenState(false);
              }}
            ></button>
            <p>
              <strong>Datenschutzhinweis</strong>
            </p>
          </header>
          {error && <p>{error.message}</p>}
          {loading && (
            <LoadingSpinner>Lade Datenschutzhinweis...</LoadingSpinner>
          )}
          {!loading && value && (
            <>
              <h4>{value?.data()!.datenschutzhinweis.what.heading}</h4>
              <p>{value?.data()!.datenschutzhinweis.what.text}</p>
              <h4>{value?.data()!.datenschutzhinweis.howLong.heading}</h4>
              <p>{value?.data()!.datenschutzhinweis.howLong.text}</p>
              <h4>{value?.data()!.datenschutzhinweis.under18.heading}</h4>
              <p>{value?.data()!.datenschutzhinweis.under18.text}</p>
            </>
          )}
          <footer>
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
          </footer>
        </article>
      </dialog>
    </>
  );
}

"use client";

import InterviewCard from "@/app/lib/components/InterviewCard";
import { db, storage } from "@/app/lib/firebase-config";
import { collection } from "firebase/firestore";
import Link from "next/link";
import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useDownloadURL } from "react-firebase-hooks/storage";

export default function Einsendungen() {
  const [value, loading, error] = useCollection(
    collection(db, "kurzinterviews")
  );

  const [editMode, setEditMode] = useState(false);

  function downloadAll() {
    alert("Alle downloaden");
  }

  return (
    <>
      <h1>Einsendungen</h1>

      <div className="mb-2">
        <Link href="/" role="button">
          zum Formular
        </Link>{" "}
        <button onClick={downloadAll}>Alle downloaden</button>{" "}
        <button onClick={() => setEditMode((prev) => !prev)}>
          {editMode ? "Fertig" : "Bearbeiten"}
        </button>
      </div>

      <div>
        {error && <strong>Fehler: {error.message}</strong>}
        {loading && <span>Lade Einsendungen...</span>}

        {value && (
          <div className="grid">
            {value.docs.map((interview) => {
              return (
                <InterviewCard
                  key={interview.data().id}
                  imgPath={interview.data().picture}
                  name={interview.data().name}
                  age={interview.data().age}
                  answers={interview.data().questions}
                  editMode={editMode}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

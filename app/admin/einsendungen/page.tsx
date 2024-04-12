"use client";

import { db } from "@/app/lib/firebase-config";
import { collection, doc } from "firebase/firestore";
import InterviewCard from "@/app/lib/components/InterviewCard";
import LoadingSpinner from "@/app/lib/components/LoadingSpinner";
import { useState } from "react";
import { useCollection, useDocumentOnce } from "react-firebase-hooks/firestore";
import type { Answer } from "@/app/lib/types/Answer";

export default function Einsendungen() {
  const [value, loading, error] = useCollection(
    collection(db, "kurzinterviews"),
  );

  const [answersValue, answersLoading, answersError] = useDocumentOnce(
    doc(db, "settings", "settings"),
  );

  const [editMode, setEditMode] = useState(false);
  const [showAsList, setShowAsList] = useState(true);

  function getQuestionAnswer(answers) {
    let returnAnswer = "";

    answers.forEach((answer) => {
      returnAnswer += answer.question + "\n";
      returnAnswer += answer.answer + "\n\n";
    });

    return returnAnswer;
  }

  function addPerson(interview: {
    id: string;
    name: string;
    age: number;
    picture: string;
    answers: Answer[];
  }) {
    return `Name: ${interview.name}, Alter: ${interview.age}
Bild: ${interview.picture}

${getQuestionAnswer(interview.answers)}
=============================================\n\n`;
  }

  async function downloadAll() {
    const link = document.createElement("a");

    let content = "";
    value?.docs.forEach((interview) => {
      content += addPerson(
        interview.data() as {
          id: string;
          name: string;
          age: number;
          picture: string;
          answers: Answer[];
        },
      );
    });

    const file = new Blob([content], { type: "text/plain" });
    link.href = URL.createObjectURL(file);
    const now = new Date();
    link.download = `alle-Teilnehmer_${now.toLocaleDateString()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <>
      <h1>Einsendungen</h1>

      <div className="grid mb-2">
        {/* <Link href="/" role="button">
          zum Formular
        </Link>{" "} */}
        <button onClick={downloadAll}>Alle downloaden</button>{" "}
        <button
          className="secondary"
          onClick={() => setEditMode((prev) => !prev)}
        >
          {editMode ? "Fertig" : "Bearbeiten"}
        </button>
      </div>

      <hr />

      <label>
        <input
          type="checkbox"
          role="switch"
          checked={showAsList}
          onChange={() => setShowAsList((prev) => !prev)}
        />
        Liste
      </label>

      <hr />

      <div>
        {error && <strong>Fehler: {error.message}</strong>}
        {loading && <LoadingSpinner>Lade Einsendungen...</LoadingSpinner>}

        {value && (
          <div className="grid">
            {value.docs.length === 0 && <p>Keine Einsendungen</p>}
            {value.docs.length > 0 &&
              value.docs.map((interview) => {
                return (
                  <InterviewCard
                    key={interview.data().id as string}
                    id={interview.data().id as string}
                    imgPath={interview.data().picture as string}
                    name={interview.data().name as string}
                    age={interview.data().age as number}
                    answers={interview.data().answers as Answer[]}
                    editMode={editMode}
                    showAsList={showAsList}
                  />
                );
              })}
          </div>
        )}
      </div>
    </>
  );
}

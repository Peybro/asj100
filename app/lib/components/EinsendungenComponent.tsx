"use client";

import { db } from "@/firebase-config";
import { collection } from "firebase/firestore";
import InterviewCard from "@/components/InterviewCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import type { Answer } from "@/types/Answer";
import Toolbar from "@/components/Toolbar";
import ErrorIndicator from "@/components/ErrorIndicator";
import { Interview } from "../types/Interview";

/**
 * Shows all interviews that have been submitted
 */
export default function EinsendungenComponent() {
  // Firebase hooks
  const [interviewsValue, interviewsLoading, interviewsError] = useCollection(
    collection(db, "kurzinterviews"),
  );

  // Local state
  const [editMode, setEditMode] = useState(false);
  const [showAsList, setShowAsList] = useState(true);

  /**
   * Builds the answer string for a person in a readable format
   * @param answers Answer array of a person
   * @returns String with all answers
   */
  function buildAnswerString(answers: Answer[]) {
    let returnAnswer = "";

    answers.forEach((answer: Answer) => {
      returnAnswer += answer.question + "\n";
      returnAnswer += answer.answer + "\n\n";
    });

    return returnAnswer;
  }

  /**
   * Adds a person to the download string
   * @param interview Person to add
   * @returns String with all information of the person
   */
  function addPerson(interview: Interview) {
    return `Name: ${interview.name}, Alter: ${interview.age}, Ort: ${interview.location},
Bild: ${interview.picture}

${buildAnswerString(interview.answers)}
=============================================\n\n`;
  }

  /**
   * Downloads all interviews as a text file
   */
  async function downloadAll() {
    const link = document.createElement("a");

    let content = "";
    (interviewsValue?.docs).forEach((interviewData) => {
      const interview = interviewData.data() as Interview;
      content += addPerson(interview);
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

      <Toolbar>
        <button
          onClick={downloadAll}
          disabled={!interviewsValue || interviewsValue?.docs?.length === 0}
        >
          Alle downloaden
        </button>{" "}
        <button
          className="secondary"
          onClick={() => setEditMode((prev) => !prev)}
          disabled={!interviewsValue || interviewsValue?.docs?.length === 0}
        >
          {editMode ? "Fertig" : "Bearbeiten"}
        </button>
      </Toolbar>

      <label>
        <input
          type="checkbox"
          role="switch"
          checked={showAsList}
          onChange={() => setShowAsList((prev) => !prev)}
        />
        Liste
      </label>

      <div className="mt-5">
        {interviewsError && <ErrorIndicator error={interviewsError} />}
        {interviewsLoading && (
          <LoadingSpinner>Lade Einsendungen...</LoadingSpinner>
        )}

        {!interviewsLoading && interviewsValue && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {interviewsValue.docs.length === 0 && <p>Keine Einsendungen</p>}
            {interviewsValue.docs.length > 0 &&
              interviewsValue.docs.map((interviewData) => {
                const interview = interviewData.data() as Interview;

                return (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    editMode={editMode}
                    onRemove={() => {
                      if (interviewsValue?.docs?.length === 0)
                        setEditMode(false);
                    }}
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

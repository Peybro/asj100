"use client";

import { db, storage } from "@/firebase-config";
import { collection } from "firebase/firestore";
import InterviewCard from "@/components/InterviewCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import type { Answer } from "@/types/Answer";
import Toolbar from "@/components/Toolbar";
import ErrorIndicator from "@/components/ErrorIndicator";
import { Interview } from "../types/Interview";
import { useDownloadURL } from "react-firebase-hooks/storage";
import { deleteObject, ref } from "firebase/storage";
import { deleteDoc, doc } from "firebase/firestore";

/**
 * Shows all interviews that have been submitted
 */
export default function EinsendungenComponent() {
  // Firebase hooks
  const [interviewsValue, interviewsLoading, interviewsError] = useCollection(
    collection(db, "kurzinterviews"),
  );

  const [pictureLinksValue, pictureLinksLoading, pictureLinksError] =
    useCollection(collection(db, "portraitLinks"));

  // Local state
  const [editMode, setEditMode] = useState(false);
  const [editButtonClicked, setEditButtonClicked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3);

  // Timer for the edit button to confirm the deletion
  useEffect(() => {
    if (!editButtonClicked) return;

    let timer = null;
    timer = setInterval(() => {
      if (editMode) {
        clearInterval(timer);
      }
      if (timeRemaining === 1) {
        clearInterval(timer);
        setEditButtonClicked(false);
        setTimeRemaining(3);
      } else {
        setTimeRemaining((prev) => prev - 1);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editButtonClicked, timeRemaining]);

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
    const { name, answers } = interview;
    return `Name: ${name ? name : "Anonym"}

${buildAnswerString(answers)}
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

  async function remove(pictureLink: string) {
    const pictureStorageRef = ref(storage, `portraits/${pictureLink}`);
    try {
      await deleteDoc(doc(db, "portraitLinks", pictureLink.split(".")[0]));
      await deleteObject(pictureStorageRef);
    } catch (error) {
      console.error(error);
    }
  }

  function Picture({ pictureLink }: { pictureLink: string }): JSX.Element {
    const pictureStorageRef = ref(storage, `portraits/${pictureLink}`);
    const [pictureUrl, pictureLoading, pictureError] =
      useDownloadURL(pictureStorageRef);

    return (
      <>
        {pictureError && (
          <ErrorIndicator error={pictureError}>
            <p>Fehler beim Laden des Bildes</p>
          </ErrorIndicator>
        )}
        {pictureLoading && <LoadingSpinner>Lade Bild...</LoadingSpinner>}
        {!pictureLoading && pictureUrl && (
          <article>
            {/* <header>Header</header> */}
            <img src={pictureUrl} alt={`Bild`} className="mb-2 w-full" />
            {editMode && (
              <footer>
                <button
                  className="border-red-500 bg-red-500"
                  onClick={() => remove(pictureLink)}
                >
                  Löschen
                </button>
              </footer>
            )}
          </article>
        )}
      </>
    );
  }

  function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  return (
    <>
      <h1>Einsendungen ({interviewsValue?.docs?.length})</h1>

      <Toolbar>
        <button
          className="outline"
          onClick={downloadAll}
          disabled={!interviewsValue || interviewsValue?.docs?.length === 0}
        >
          Alle downloaden
        </button>{" "}
        <button
          className={
            editMode
              ? ""
              : editButtonClicked
                ? "border-yellow-500 bg-yellow-500"
                : "secondary outline"
          }
          onClick={() => {
            if (!editMode) {
              if (editButtonClicked) {
                setEditMode(true);
                setEditButtonClicked(false);
              } else {
                setEditButtonClicked(true);
              }
            } else {
              setEditMode(false);
              setTimeRemaining(3);
            }
          }}
          disabled={!interviewsValue || interviewsValue?.docs?.length === 0}
        >
          {editMode
            ? "Fertig"
            : editButtonClicked
              ? `Bestätigen (${timeRemaining})`
              : "Bearbeiten"}
        </button>
      </Toolbar>

      <details>
        <summary role="button" className="">
          Antworten
        </summary>

        <div className="mt-5">
          {interviewsError && <ErrorIndicator error={interviewsError} />}
          {interviewsLoading && (
            <LoadingSpinner>Lade Einsendungen...</LoadingSpinner>
          )}

          {!interviewsLoading && interviewsValue && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {interviewsValue.docs.length === 0 && <p>Keine Einsendungen</p>}
              {interviewsValue.docs.length > 0 &&
                interviewsValue.docs.map((interviewData, i) => {
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
                      index={i}
                    />
                  );
                })}
            </div>
          )}
        </div>
      </details>

      <details>
        <summary role="button" className="">
          Bilder <small>(zufällige Reihenfolge)</small>
        </summary>

        <div className="mt-5">
          {pictureLinksError && <ErrorIndicator error={pictureLinksError} />}
          {pictureLinksLoading && (
            <LoadingSpinner>Lade Bilder...</LoadingSpinner>
          )}

          {!pictureLinksLoading && pictureLinksValue && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {pictureLinksValue.docs.length === 0 && <p>Keine Bilder</p>}
              {pictureLinksValue.docs.length > 0 &&
                shuffleArray(pictureLinksValue.docs).map((pictureLinkData) => {
                  const pictureLink = pictureLinkData.data();

                  return (
                    <Picture
                      key={pictureLinkData.id}
                      pictureLink={pictureLink.pictureName}
                    />
                  );
                })}
            </div>
          )}
        </div>
      </details>
    </>
  );
}

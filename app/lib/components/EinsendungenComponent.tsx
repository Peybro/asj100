"use client";

import { db, storage } from "@/firebase-config";
import { collection } from "firebase/firestore";
import InterviewCard from "@/components/InterviewCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useEffect, useState, useMemo} from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import type { Answer } from "@/types/Answer";
import Toolbar from "@/components/Toolbar";
import ErrorIndicator from "@/components/ErrorIndicator";
import { Interview } from "../types/Interview";
import { useDownloadURL } from "react-firebase-hooks/storage";
import { deleteObject, ref } from "firebase/storage";
import { deleteDoc, doc } from "firebase/firestore";
import {
  Download,
  FileImage,
  FileQuestionMark,
  FileUser,
  MessageSquareWarning,
  SquarePen,
} from "lucide-react";

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
  const [sortAnswers, setSortAnswers] = useState(false);

  // Shuffled list of pictures, only recomputed when pictureLinksValue changes
  const shuffledPictures = useMemo(() => {
    if (!pictureLinksValue || pictureLinksValue.docs.length === 0) return [];

    const validDocs = pictureLinksValue.docs.filter((doc) => {
      const data = doc.data();
      return data && data.pictureName;
    });

    return shuffleArray(validDocs);
  }, [pictureLinksValue]);


  type UniqueQuestion = { question: string; answers: string[] };
  const [uniqueQuestions, setUniqueQuestions] = useState<UniqueQuestion[]>([]);

  // Get all unique questions from the interviews
  useEffect(() => {
    if (!interviewsValue) return;
    const questions: UniqueQuestion[] = [];
    interviewsValue.docs.forEach((interviewData) => {
      const interview = interviewData.data() as Interview;
      interview.answers.forEach((answer) => {
        const existingQuestion = questions.find(
          (q) => q.question === answer.question,
        );
        if (existingQuestion) {
          existingQuestion.answers.push(answer.answer);
        } else {
          questions.push({
            question: answer.question,
            answers: [answer.answer],
          });
        }
      });
    });
    setUniqueQuestions(questions);
  }, [interviewsValue]);

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

  async function removePicture(pictureLink: string) {
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
                  onClick={() => removePicture(pictureLink)}
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
    if (!Array.isArray(array)) return [];
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }


  return (
    <>
      <h1>Einsendungen</h1>

      <Toolbar>
        <button
          className="flex items-center gap-2 outline"
          onClick={downloadAll}
          disabled={!interviewsValue || interviewsValue?.docs?.length === 0}
        >
          <Download /> Alle downloaden
        </button>{" "}
        <button
          className={`${
            editMode
              ? ""
              : editButtonClicked
                ? "border-yellow-500 bg-yellow-500"
                : "secondary outline"
          } flex items-center gap-2`}
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
          {editMode && "Fertig"}
          {!editMode &&
            editButtonClicked &&
            timeRemaining > 0 &&
            `Bestätigen (${timeRemaining})`}
          {!editMode && !editButtonClicked && (
            <>
              <SquarePen />
              Bearbeiten
            </>
          )}
        </button>
      </Toolbar>

      <details>
        <summary role="button" className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <MessageSquareWarning />{" "}
            <span>Antworten ({interviewsValue?.docs?.length})</span>
          </span>
        </summary>

        <div className="mt-5">
          <label className="mb-4 flex items-center gap-2">
            <span
              className={`flex items-center gap-2 ${sortAnswers ? "text-gray-600" : "text-green-500"}`}
            >
              Nach Personen sortieren <FileUser />
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={sortAnswers}
              onChange={() => setSortAnswers((prev) => !prev)}
            />
            <span
              className={`flex items-center gap-2 ${!sortAnswers ? "text-gray-600" : "text-green-500"}`}
            >
              Nach Fragen sortieren <FileQuestionMark />
            </span>
          </label>

          {interviewsError && <ErrorIndicator error={interviewsError} />}
          {interviewsLoading && (
            <LoadingSpinner>Lade Einsendungen...</LoadingSpinner>
          )}
          {!interviewsLoading && interviewsValue && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {interviewsValue.docs.length === 0 && <p>Keine Einsendungen</p>}
              {/* list answers sorted by question */}
              {/* check for same questions and list corresponding answers */}
              {uniqueQuestions.length > 0 &&
                sortAnswers &&
                uniqueQuestions.map((questionData, i) => (
                  <article key={`question_${i}`}>
                    <details>
                      <summary>
                        {questionData.question}{" "}
                        <span className="font-bold">
                          (
                          {
                            questionData.answers.filter(
                              (a) =>
                                a !== null &&
                                a !== undefined &&
                                a !== "" &&
                                a !== "-",
                            ).length
                          }
                          )
                        </span>
                      </summary>
                      <br />
                      {questionData.answers.map((answer, j) => {
                        if (answer && answer !== "" && answer !== "-")
                          return (
                            <span key={j}>
                              {"> "}
                              <span className="italic">{answer}</span>
                              <br />
                            </span>
                          );
                      })}
                    </details>
                  </article>
                ))}

              {/* list answers sorted by person */}
              {interviewsValue.docs.length > 0 &&
                !sortAnswers &&
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
        <summary role="button" className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <FileImage />{" "}
            <span>Bilder ({pictureLinksValue?.docs?.length})</span>
            <small>(zufällige Reihenfolge)</small>
          </span>
        </summary>

        <div className="mt-5">
          {pictureLinksError && <ErrorIndicator error={pictureLinksError} />}
          {pictureLinksLoading && (
            <LoadingSpinner>Lade Bilder...</LoadingSpinner>
          )}

          {!pictureLinksLoading && pictureLinksValue && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {pictureLinksValue.docs.length === 0 && <p>Keine Bilder</p>}
              {shuffledPictures.length > 0 && shuffledPictures.map((pictureLinkData) => {
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

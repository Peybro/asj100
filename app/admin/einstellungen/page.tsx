"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { db } from "@/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { MouseEvent, useEffect, useState } from "react";
import { useDocument } from "react-firebase-hooks/firestore";
import { SubmitHandler, useForm } from "react-hook-form";
import { Bounce, toast } from "react-toastify";
import type { Question } from "@/types/Question";
import type { Datenschutz } from "@/types/Datenschutz";
import Toolbar from "@/components/Toolbar";
import ErrorIndicator from "@/components/ErrorIndicator";
import { v4 as uuid } from "uuid";
import { DescriptionTexts } from "@/types/DescriptionTexts";

type FormData = {
  welcomeText: string;
  aboutYouDescription: string;
  questionsDescription: string;
  [
    key: `${"question" | "example" | "type" | "ds-title" | "ds-text"}-${string}`
  ]: string;
};

export default function Einstellungen() {
  // form-hooks
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  // Firestore hooks
  const [settingsValue, settingsLoading, settingsError] = useDocument(
    doc(db, "settings", "settings"),
  );

  // Local state
  const [descriptions, setDescriptions] = useState<DescriptionTexts>({
    welcomeText: "",
    aboutYouDescription: "",
    questionsDescription: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [datenschutz, setDatenschutz] = useState<Datenschutz[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", () => setWindowWidth(window.innerWidth));
    return () => window.removeEventListener("resize", () => setWindowWidth(0));
  });

  const dataHasChanged = !(
    (settingsValue?.data()?.descriptionTexts as DescriptionTexts)
      ?.welcomeText === descriptions.welcomeText &&
    (settingsValue?.data()?.descriptionTexts as DescriptionTexts)
      ?.aboutYouDescription === descriptions.aboutYouDescription &&
    (settingsValue?.data()?.descriptionTexts as DescriptionTexts)
      ?.questionsDescription === descriptions.questionsDescription &&
    JSON.stringify(settingsValue?.data()?.questions) ===
      JSON.stringify(questions.map(({ uuid: _, ...question }) => question)) &&
    JSON.stringify(settingsValue?.data()?.datenschutzhinweis) ===
      JSON.stringify(datenschutz.map(({ uuid: _, ...hinweis }) => hinweis))
  );

  function resetValuesToStoredData() {
    const firebaseData = settingsValue?.data();
    const descriptionData = firebaseData?.descriptionTexts as DescriptionTexts;
    const questionData = (firebaseData?.questions as Question[]).map(
      (question) => ({
        ...question,
        uuid: uuid(),
      }),
    );
    const datenschutzData = (
      firebaseData?.datenschutzhinweis as Datenschutz[]
    ).map((hinweis) => ({ ...hinweis, uuid: uuid() }));

    // Set form values with data from Firestore
    setValue("welcomeText", descriptionData.welcomeText);
    setValue("aboutYouDescription", descriptionData.aboutYouDescription);
    setValue("questionsDescription", descriptionData.questionsDescription);

    questionData.forEach((question, i) => {
      setValue(`question-${question.uuid}`, question.question);
      setValue(`example-${question.uuid}`, question.example);
    });

    datenschutzData.forEach((hinweis, i) => {
      setValue(`ds-title-${hinweis.uuid}`, hinweis.title);
      setValue(`ds-text-${hinweis.uuid}`, hinweis.text);
    });

    // Set local state
    setDescriptions(descriptionData);
    setQuestions(questionData);
    setDatenschutz(datenschutzData);
  }

  // Set form values from Firestore to local state
  useEffect(() => {
    if (settingsLoading) return;
    resetValuesToStoredData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoading]);

  /**
   * Save settings to Firestore
   * @param data - Form data
   */
  const safeSettings: SubmitHandler<FormData> = async (data) => {
    type Setting = {
      descriptionTexts: DescriptionTexts;
      questions: Question[];
      datenschutzhinweis: Datenschutz[];
    };

    const settings: Setting = {
      descriptionTexts: descriptions,
      questions: [],
      datenschutzhinweis: [],
    };

    questions.forEach((question) => {
      settings.questions.push({
        question: data[`question-${question.uuid}`],
        example: data[`example-${question.uuid}`],
        type: question.type || "text",
      });
    });

    datenschutz.forEach((hinweis) => {
      settings.datenschutzhinweis.push({
        title: data[`ds-title-${hinweis.uuid}`],
        text: data[`ds-text-${hinweis.uuid}`],
      });
    });

    try {
      await setDoc(doc(db, "settings", "settings"), settings, { merge: true });
      toast.success("Einstellungen gespeichert", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    } catch (error) {
      setError("root", {
        message:
          "Fehler beim Speichern der Einstellungen. Bitte versuche es erneut.",
      });
    }
  };

  /**
   * Add a new question to the form
   * @param e - MouseEvent
   */
  function addQuestion(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const newQuestion: Question = {
      uuid: uuid(),
      question: "",
      example: "",
      type: "text",
    };
    setQuestions((prev) => [...prev, newQuestion]);
  }

  /**
   * Remove a question from the form
   * @param index - Index of the question
   */
  function removeQuestion(e: MouseEvent<HTMLButtonElement>, uuid: string) {
    e.preventDefault();
    setQuestions((prev) => prev.filter((question) => question.uuid !== uuid));
  }

  /**
   * Add a new Hinweis to the form
   * @param e - MouseEvent
   */
  function addHinweis(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const newHinweis: Datenschutz = { uuid: uuid(), title: "", text: "" };
    setDatenschutz((prev) => [...prev, newHinweis]);
  }

  /**
   * Remove a Hinweis from the form
   * @param index - Index of the Hinweis
   */
  function removeHinweis(e: MouseEvent<HTMLButtonElement>, uuid: string) {
    e.preventDefault();
    setDatenschutz((prev) => prev.filter((hinweis) => hinweis.uuid !== uuid));
  }

  return (
    <>
      <h1>Einstellungen</h1>

      <Toolbar sticky={dataHasChanged}>
        {dataHasChanged && (
          <button
            className="border-yellow-500 bg-yellow-500"
            onClick={resetValuesToStoredData}
            disabled={!settingsValue || isSubmitting || !dataHasChanged}
          >
            Änderungen verwerfen
          </button>
        )}
        <button
          form="settingsForm"
          disabled={!settingsValue || isSubmitting || !dataHasChanged}
        >
          {isSubmitting ? "Speichert..." : "Speichern"}
        </button>
        {errors.root && <ErrorIndicator>{errors.root.message}</ErrorIndicator>}
      </Toolbar>

      {settingsError && <ErrorIndicator error={settingsError} />}
      {settingsLoading && (
        <LoadingSpinner>Lade Einstellungen...</LoadingSpinner>
      )}

      {!settingsLoading && questions && datenschutz && (
        <form id="settingsForm" onSubmit={handleSubmit(safeSettings)}>
          <fieldset className="grid sm:grid-cols-1 lg:grid-cols-3">
            <details open={windowWidth >= 1024}>
              <summary className="text-xl">Beschreibungen</summary>

              <label>
                Begrüßungstext
                <textarea
                  {...register("welcomeText")}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setDescriptions((prev) => ({
                      ...prev,
                      welcomeText: value,
                    }));
                  }}
                />
              </label>

              <label>
                Fragen
                <textarea
                  {...register("questionsDescription")}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setDescriptions((prev) => ({
                      ...prev,
                      questionsDescription: value,
                    }));
                  }}
                />
              </label>
            </details>

            <details open={windowWidth >= 1024}>
              <summary className="text-xl">Fragen ({questions.length})</summary>

              <button type="submit" className="secondary" onClick={addQuestion}>
                Neue Frage
              </button>

              {questions.length === 0 && (
                <p>Es wurden noch keine Fragen hinzugefügt.</p>
              )}

              <div className="autogrid">
                {questions.map((question, i) => {
                  return (
                    <details key={`question-${question.uuid}`}>
                      <summary>
                        {question.question === "" ? (
                          <>
                            {`[Frage ${i + 1}]`}{" "}
                            <span className="text-red-500">
                              {errors[`question-${question.uuid}`]
                                ? errors[`question-${question.uuid}`].message
                                : ""}
                            </span>
                          </>
                        ) : (
                          question.question
                        )}
                      </summary>

                      <article>
                        <label>
                          Frage
                          <textarea
                            {...(Object.hasOwn(
                              errors,
                              `question-${question.uuid}`,
                            )
                              ? {
                                  "aria-invalid": Object.hasOwn(
                                    errors,
                                    `question-${question.uuid}`,
                                  ),
                                }
                              : {})}
                            aria-describedby={`valid-helper-question-${question.uuid}`}
                            {...register(`question-${question.uuid}`, {
                              required: {
                                value: true,
                                message: "Bitte eine Frage angeben.",
                              },
                              minLength: {
                                value: 5,
                                message: `Die Frage muss mindestens 5 Zeichen lang sein.`,
                              },
                              onChange(event) {
                                setQuestions((prev) =>
                                  prev.toSpliced(i, 1, {
                                    ...question,
                                    question: event.target.value,
                                  }),
                                );
                              },
                            })}
                          />
                          {errors[`question-${question.uuid}`] && (
                            <small
                              id={`valid-helper-question-${question.uuid}`}
                            >
                              {errors[`question-${question.uuid}`]?.message}
                            </small>
                          )}
                        </label>

                        <label>
                          Typ
                          <select
                            {...(Object.hasOwn(errors, `type-${question.uuid}`)
                              ? {
                                  "aria-invalid": Object.hasOwn(
                                    errors,
                                    `type-${question.uuid}`,
                                  ),
                                }
                              : {})}
                            aria-describedby={`valid-helper-type-${question.uuid}`}
                            {...register(`type-${question.uuid}`, {
                              required: {
                                value: true,
                                message: "Bitte den Typ der Frage angeben.",
                              },
                              onChange(event) {
                                setQuestions((prev) =>
                                  prev.toSpliced(i, 1, {
                                    ...question,
                                    type: event.target.value,
                                  }),
                                );
                              },
                            })}
                          >
                            <option
                              value="text"
                              selected={
                                question.type === "text" ||
                                question.type === undefined
                              }
                            >
                              Text
                            </option>
                            <option
                              value="yesno"
                              selected={question.type === "yesno"}
                            >
                              Ja / Nein
                            </option>
                          </select>
                          {errors[`type-${question.uuid}`] && (
                            <small id={`valid-helper-type-${question.uuid}`}>
                              {errors[`type-${question.uuid}`]?.message}
                            </small>
                          )}
                        </label>

                        {(question.type === "text" ||
                          question.type === undefined) && (
                          <label>
                            Beispiel
                            <textarea
                              {...(Object.hasOwn(
                                errors,
                                `example-${question.uuid}`,
                              )
                                ? {
                                    "aria-invalid": Object.hasOwn(
                                      errors,
                                      `example-${question.uuid}`,
                                    ),
                                  }
                                : {})}
                              aria-describedby={`valid-helper-example-${question.uuid}`}
                              {...register(`example-${question.uuid}`, {
                                required: {
                                  value: false,
                                  message: `Bitte ein Beispiel für Frage ${question.uuid} angeben.`,
                                },
                                onChange(event) {
                                  setQuestions((prev) =>
                                    prev.toSpliced(i, 1, {
                                      ...question,
                                      example: event.target.value,
                                    }),
                                  );
                                },
                              })}
                            />
                            {errors[`example-${question.uuid}`] && (
                              <small
                                id={`valid-helper-example-${question.uuid}`}
                              >
                                {errors[`example-${question.uuid}`]?.message}
                              </small>
                            )}
                          </label>
                        )}

                        <footer className="flex justify-between">
                          <button
                            className="border-red-500 bg-red-500"
                            onClick={(e) => removeQuestion(e, question.uuid)}
                          >
                            Entfernen
                          </button>

                          <div className="flex gap-1">
                            <button
                              disabled={i === 0}
                              onClick={(e) => {
                                e.preventDefault();
                                if (i > 0) {
                                  setQuestions((prev) => {
                                    const newQuestions = prev.toSpliced(
                                      i - 1,
                                      0,
                                      question,
                                    );
                                    newQuestions.splice(i + 1, 1); // Remove the original at i+1
                                    return newQuestions;
                                  });
                                }
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-chevron-up"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"
                                />
                              </svg>
                            </button>
                            <button
                              disabled={i === questions.length - 1}
                              onClick={(e) => {
                                e.preventDefault();
                                if (i < questions.length - 1) {
                                  setQuestions((prev) => {
                                    const newQuestions = prev.toSpliced(
                                      i + 2,
                                      0,
                                      question,
                                    );
                                    newQuestions.splice(i, 1); // Remove the original at i
                                    return newQuestions;
                                  });
                                }
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-chevron-down"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
                                />
                              </svg>
                            </button>
                          </div>
                        </footer>
                      </article>
                    </details>
                  );
                })}
              </div>
            </details>

            <details open={windowWidth >= 1024}>
              <summary className="hyphens-manual text-xl">
                Daten&shy;schutz&shy;hinweis ({datenschutz.length})
              </summary>

              <button type="submit" className="secondary" onClick={addHinweis}>
                Neuer Hinweis
              </button>

              {datenschutz.length === 0 && (
                <p>Es wurden noch keine Hinweise hinzugefügt.</p>
              )}

              <div className="autogrid">
                {datenschutz.map((hinweis, i) => (
                  <details key={`hinweis-${hinweis.uuid}`}>
                    <summary>
                      {hinweis.title === "" ? (
                        <>
                          {`[Hinweis ${i + 1}]`}{" "}
                          <span className="text-red-500">
                            {errors[`ds-title-${hinweis.uuid}`]
                              ? errors[`ds-title-${hinweis.uuid}`].message
                              : errors[`ds-text-${hinweis.uuid}`]
                                ? errors[`ds-text-${hinweis.uuid}`].message
                                : ""}
                          </span>
                        </>
                      ) : (
                        hinweis.title
                      )}
                    </summary>

                    <article>
                      <label>
                        Titel
                        <textarea
                          {...(Object.hasOwn(errors, `ds-title-${hinweis.uuid}`)
                            ? {
                                "aria-invalid": Object.hasOwn(
                                  errors,
                                  `ds-title-${hinweis.uuid}`,
                                ),
                              }
                            : {})}
                          aria-describedby={`valid-helper-ds-title-${hinweis.uuid}`}
                          {...register(`ds-title-${hinweis.uuid}`, {
                            required: {
                              value: true,
                              message: `Bitte einen Titel für den Hinweis angeben.`,
                            },
                            minLength: {
                              value: 10,
                              message: `Der Titel muss mindestens 10 Zeichen lang sein.`,
                            },
                            onChange(event) {
                              setDatenschutz((prev) =>
                                prev.toSpliced(i, 1, {
                                  ...hinweis,
                                  title: event.target.value,
                                }),
                              );
                            },
                          })}
                        />
                        {errors[`ds-title-${hinweis.uuid}`] && (
                          <small id={`valid-helper-ds-title-${hinweis.uuid}`}>
                            {errors[`ds-title-${hinweis.uuid}`]?.message}
                          </small>
                        )}
                      </label>

                      <label>
                        Text
                        <textarea
                          {...(Object.hasOwn(errors, `ds-text-${hinweis.uuid}`)
                            ? {
                                "aria-invalid": Object.hasOwn(
                                  errors,
                                  `ds-text-${hinweis.uuid}`,
                                ),
                              }
                            : {})}
                          aria-describedby={`valid-helper-ds-text-${hinweis.uuid}`}
                          {...register(`ds-text-${hinweis.uuid}`, {
                            required: {
                              value: true,
                              message: `Bitte eine Beschreibung für den Hinweis angeben.`,
                            },
                            minLength: {
                              value: 10,
                              message: `Der Hinweis muss mindestens 10 Zeichen lang sein.`,
                            },
                            onChange(event) {
                              setDatenschutz((prev) =>
                                prev.toSpliced(i, 1, {
                                  ...hinweis,
                                  text: event.target.value,
                                }),
                              );
                            },
                          })}
                          rows={5}
                        />
                        {errors[`ds-text-${hinweis.uuid}`] && (
                          <small id={`valid-helper-ds-text-${hinweis.uuid}`}>
                            {errors[`ds-text-${hinweis.uuid}`]?.message}
                          </small>
                        )}
                      </label>

                      <footer>
                        <button
                          className="border-red-500 bg-red-500"
                          onClick={(e) => removeHinweis(e, hinweis.uuid)}
                        >
                          Entfernen
                        </button>
                      </footer>
                    </article>
                  </details>
                ))}
              </div>
            </details>
          </fieldset>
        </form>
      )}
    </>
  );
}

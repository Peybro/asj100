"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { db } from "@/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { MouseEvent, useEffect, useState } from "react";
import { useDocumentOnce } from "react-firebase-hooks/firestore";
import { SubmitHandler, useForm } from "react-hook-form";
import { Bounce, toast } from "react-toastify";
import type { Question } from "@/types/Question";
import type { Datenschutz } from "@/types/Datenschutz";
import Toolbar from "@/components/Toolbar";
import ErrorIndicator from "@/components/ErrorIndicator";
import { v4 as uuid } from "uuid";
import { DescriptionTexts } from "@/types/DescriptionTexts";

function Close() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
}

type FormData = {
  welcomeText: string;
  aboutYouDescription: string;
  questionsDescription: string;
  [key: `${"question" | "example" | "ds-title" | "ds-text"}-${string}`]: string;
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
  const [settingsValue, settingsLoading, settingsError] = useDocumentOnce(
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

  // Set form values from Firestore to local state
  useEffect(() => {
    if (settingsLoading) return;

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

    const newQuestion: Question = { uuid: uuid(), question: "", example: "" };
    setQuestions((prev) => [...prev, newQuestion]);
  }

  /**
   * Remove a question from the form
   * @param index - Index of the question
   */
  function removeQuestion(index: number) {
    setQuestions((prev) => prev.toSpliced(index, 1));
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
  function removeHinweis(index: number) {
    setDatenschutz((prev) => prev.toSpliced(index, 1));
  }

  return (
    <>
      <h1>Einstellungen</h1>

      <Toolbar sticky={dataHasChanged}>
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
                {'"Über dich"'}
                <textarea
                  {...register("aboutYouDescription")}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setDescriptions((prev) => ({
                      ...prev,
                      aboutYouDescription: value,
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
                    <article key={`question-${question.uuid}`}>
                      <header className="flex h-12 justify-between text-lg">
                        <p>Frage {i + 1}</p>
                        <span onClick={() => removeQuestion(i)}>
                          <Close />
                        </span>
                      </header>

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
                          })}
                          onChange={(e) => {
                            setQuestions((prev) =>
                              prev.toSpliced(i, 1, {
                                ...question,
                                question: e.target.value,
                              }),
                            );
                          }}
                        />
                        {errors[`question-${question.uuid}`] && (
                          <small id={`valid-helper-question-${question.uuid}`}>
                            {errors[`question-${question.uuid}`]?.message}
                          </small>
                        )}
                      </label>
                      <label>
                        Beispiel
                        <textarea
                          {...(Object.hasOwn(errors, `example-${question.uuid}`)
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
                          })}
                          onChange={(e) => {
                            setQuestions((prev) =>
                              prev.toSpliced(i, 1, {
                                ...question,
                                example: e.target.value,
                              }),
                            );
                          }}
                        />
                        {errors[`example-${question.uuid}`] && (
                          <small id={`valid-helper-example-${question.uuid}`}>
                            {errors[`example-${question.uuid}`]?.message}
                          </small>
                        )}
                      </label>
                    </article>
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
                  <article key={`hinweis${hinweis.uuid}`}>
                    <header className="flex h-12 justify-between text-lg">
                      <p>Hinweis {i + 1}</p>
                      <span onClick={() => removeHinweis(i)}>
                        <Close />
                      </span>
                    </header>

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
                        })}
                        onChange={(e) => {
                          setDatenschutz((prev) =>
                            prev.toSpliced(i, 1, {
                              ...hinweis,
                              title: e.target.value,
                            }),
                          );
                        }}
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
                        })}
                        rows={5}
                        onChange={(e) => {
                          setDatenschutz((prev) =>
                            prev.toSpliced(i, 1, {
                              ...hinweis,
                              text: e.target.value,
                            }),
                          );
                        }}
                      />
                      {errors[`ds-text-${hinweis.uuid}`] && (
                        <small id={`valid-helper-ds-text-${hinweis.uuid}`}>
                          {errors[`ds-text-${hinweis.uuid}`]?.message}
                        </small>
                      )}
                    </label>
                  </article>
                ))}
              </div>
            </details>
          </fieldset>
        </form>
      )}
    </>
  );
}

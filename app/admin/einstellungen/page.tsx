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
import { set } from "firebase/database";

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
  [key: `${"question" | "example" | "ds-title" | "ds-text"}${number}`]: string;
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [datenschutz, setDatenschutz] = useState<Datenschutz[]>([]);

  // Set form values from Firestore to local state
  useEffect(() => {
    if (settingsLoading) return;

    const firebaseData = settingsValue?.data();
    const questionData = firebaseData?.questions as Question[];
    const datenschutzData = firebaseData?.datenschutzhinweis as Datenschutz[];

    // Set form values with data from Firestore
    questionData.forEach((question, i) => {
      setValue(`question${i + 1}`, question.question);
      setValue(`example${i + 1}`, question.example);
    });

    datenschutzData.forEach((hinweis, i) => {
      setValue(`ds-title${i + 1}`, hinweis.title);
      setValue(`ds-text${i + 1}`, hinweis.text);
    });

    // Set local state
    setQuestions(questionData);
    setDatenschutz(datenschutzData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoading]);

  /**
   * Save settings to Firestore
   * @param data - Form data
   */
  const safeSettings: SubmitHandler<FormData> = async (data) => {
    const settings = {
      questions: [],
      datenschutzhinweis: [],
    };

    questions.forEach((_, i) => {
      settings.questions.push({
        question: data[`question${i + 1}`],
        example: data[`example${i + 1}`],
      });
    });

    datenschutz.forEach((_, i) => {
      settings.datenschutzhinweis.push({
        title: data[`ds-title${i + 1}`],
        text: data[`ds-text${i + 1}`],
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

    const newQuestion: Question = { question: "", example: "" };
    setQuestions((prev) => [...prev, newQuestion]);
  }

  /**
   * Remove a question from the form
   * @param index - Index of the question
   */
  function removeQuestion(index: number) {
    // Set values of the following questions to the previous question because of the way react-hook-form gives the values to the inputs
    questions.forEach((question, i) => {
      if (i <= index) return;
      setValue(`question${i}`, question.question);
      setValue(`example${i}`, question.example);
    });

    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  /**
   * Add a new Hinweis to the form
   * @param e - MouseEvent
   */
  function addHinweis(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const newHinweis: Datenschutz = { title: "", text: "" };
    setDatenschutz((prev) => [...prev, newHinweis]);
  }

  /**
   * Remove a Hinweis from the form
   * @param index - Index of the Hinweis
   */
  function removeHinweis(index: number) {
    // Set values of the following Hinweise to the previous Hinweis because of the way react-hook-form gives the values to the inputs
    datenschutz.forEach((hinweis, i) => {
      if (i <= index) return;
      setValue(`ds-title${i}`, hinweis.title);
      setValue(`ds-text${i}`, hinweis.text);
    });

    setDatenschutz((prev) => [...prev.toSpliced(index, 1)]);
  }

  const dataHasChanged = !(
    JSON.stringify(settingsValue?.data()?.questions) ===
      JSON.stringify(questions) &&
    JSON.stringify(settingsValue?.data()?.datenschutzhinweis) ===
      JSON.stringify(datenschutz)
  );

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
          <fieldset className="grid sm:grid-cols-1 lg:grid-cols-2">
            <details open>
              <summary>Fragen ({questions.length})</summary>

              <button type="submit" className="secondary" onClick={addQuestion}>
                Neue Frage
              </button>

              {questions.length === 0 && (
                <p>Es wurden noch keine Fragen hinzugefügt.</p>
              )}

              <div className="autogrid">
                {questions.map((_, i) => {
                  return (
                    <article key={`question${i}`}>
                      <header className="flex justify-between">
                        <p>Frage {i + 1}</p>
                        <span onClick={() => removeQuestion(i)}>
                          <Close />
                        </span>
                      </header>

                      <label>
                        Frage
                        <textarea
                          {...(Object.hasOwn(errors, `question${i + 1}`)
                            ? {
                                "aria-invalid": Object.hasOwn(
                                  errors,
                                  `question${i + 1}`,
                                ),
                              }
                            : {})}
                          aria-describedby={`valid-helper-question${i + 1}`}
                          {...register(`question${i + 1}`, {
                            required: {
                              value: true,
                              message: "Bitte eine Frage angeben.",
                            },
                            minLength: {
                              value: 5,
                              message: `Die Frage muss mindestens 5 Zeichen lang sein.`,
                            },
                          })}
                        />
                        {errors[`question${i + 1}`] && (
                          <small id={`valid-helper-question${i + 1}`}>
                            {errors[`question${i + 1}`]?.message}
                          </small>
                        )}
                      </label>
                      <label>
                        Beispiel
                        <textarea
                          className="resize-none"
                          {...(Object.hasOwn(errors, `example${i + 1}`)
                            ? {
                                "aria-invalid": Object.hasOwn(
                                  errors,
                                  `example${i + 1}`,
                                ),
                              }
                            : {})}
                          aria-describedby={`valid-helper-example${i + 1}`}
                          {...register(`example${i + 1}`, {
                            required: {
                              value: false,
                              message: `Bitte ein Beispiel für Frage ${i + 1} angeben.`,
                            },
                          })}
                        />
                        {errors[`example${i + 1}`] && (
                          <small id={`valid-helper-example${i + 1}`}>
                            {errors[`example${i + 1}`]?.message}
                          </small>
                        )}
                      </label>
                    </article>
                  );
                })}
              </div>
            </details>

            <details open>
              <summary className="hyphens-manual">
                Daten&shy;schutz&shy;hinweis ({datenschutz.length})
              </summary>

              <button type="submit" className="secondary" onClick={addHinweis}>
                Neuer Hinweis
              </button>

              {datenschutz.length === 0 && (
                <p>Es wurden noch keine Hinweise hinzugefügt.</p>
              )}

              <div className="autogrid">
                {datenschutz.map((_, i) => (
                  <article key={`hinweis${i}`}>
                    <header className="flex justify-between">
                      <p>Hinweis {i + 1}</p>
                      <span onClick={() => removeHinweis(i)}>
                        <Close />
                      </span>
                    </header>

                    <label>
                      Titel
                      <textarea
                        {...(Object.hasOwn(errors, `ds-title${i + 1}`)
                          ? {
                              "aria-invalid": Object.hasOwn(
                                errors,
                                `ds-title${i + 1}`,
                              ),
                            }
                          : {})}
                        aria-describedby={`valid-helper-ds-title${i + 1}`}
                        {...register(`ds-title${i + 1}`, {
                          required: {
                            value: true,
                            message: `Bitte einen Titel für den Hinweis angeben.`,
                          },
                          minLength: {
                            value: 10,
                            message: `Der Titel muss mindestens 10 Zeichen lang sein.`,
                          },
                        })}
                      />
                      {errors[`ds-title${i + 1}`] && (
                        <small id={`valid-helper-ds-title${i + 1}`}>
                          {errors[`ds-title${i + 1}`]?.message}
                        </small>
                      )}
                    </label>

                    <label>
                      Text
                      <textarea
                        {...(Object.hasOwn(errors, `ds-text${i + 1}`)
                          ? {
                              "aria-invalid": Object.hasOwn(
                                errors,
                                `ds-text${i + 1}`,
                              ),
                            }
                          : {})}
                        aria-describedby={`valid-helper-ds-text${i + 1}`}
                        {...register(`ds-text${i + 1}`, {
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
                      />
                      {errors[`ds-text${i + 1}`] && (
                        <small id={`valid-helper-ds-text${i + 1}`}>
                          {errors[`ds-text${i + 1}`]?.message}
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

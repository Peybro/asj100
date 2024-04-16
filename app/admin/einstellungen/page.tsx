"use client";

import LoadingSpinner from "@/app/lib/components/LoadingSpinner";
import { db } from "@/app/lib/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { MouseEvent, useEffect, useState } from "react";
import { useDocumentOnce } from "react-firebase-hooks/firestore";
import { SubmitHandler, useForm } from "react-hook-form";
import { Bounce, toast } from "react-toastify";
import type { Question } from "@/app/lib/types/Question";
import type { Datenschutz } from "@/app/lib/types/Datenschutz";
import Toolbar from "@/app/lib/components/Toolbar";
import ErrorIndicator from "@/app/lib/components/ErrorIndicator";

function Close() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
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
    setQuestions(settingsValue?.data()!.questions as Question[]);
    setDatenschutz(settingsValue?.data()!.datenschutzhinweis as Datenschutz[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoading]);

  // Set form values from local state to form
  useEffect(() => {
    questions.forEach((question, i) => {
      setValue(`question${i + 1}`, question.question);
      setValue(`example${i + 1}`, question.example);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  // Set form values from local state to form
  useEffect(() => {
    datenschutz.forEach((hinweis, i) => {
      setValue(`ds-title${i + 1}`, hinweis.title);
      setValue(`ds-text${i + 1}`, hinweis.text);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datenschutz]);

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
    // setQuestions((prev) => [...prev.toSpliced(index, 1)]);
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
    // setDatenschutz((prev) => [...prev.toSpliced(index, 1)]);
    setDatenschutz((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      <h1>Einstellungen</h1>

      <Toolbar>
        <button form="settingsForm" disabled={!settingsValue || isSubmitting}>
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
          <fieldset>
            <h3>Fragen</h3>
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
                      <input
                        type="text"
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
                      <input
                        type="text"
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

            {questions.length === 0 && (
              <p>Es wurden noch keine Fragen hinzugefügt.</p>
            )}

            <button type="submit" className="secondary" onClick={addQuestion}>
              Neue Frage
            </button>

            <h3>Datenschutzhinweis</h3>
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
                    <input
                      type="text"
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

            {datenschutz.length === 0 && (
              <p>Es wurden noch keine Hinweise hinzugefügt.</p>
            )}

            <button type="submit" className="secondary" onClick={addHinweis}>
              Neuer Hinweis
            </button>
          </fieldset>
        </form>
      )}
    </>
  );
}

"use client";

import LoadingSpinner from "@/app/lib/components/LoadingSpinner";
import { db } from "@/app/lib/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useDocumentOnce } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
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

interface IFormData {
  [key: `question${number}`]: string;

  [key: `example${number}`]: string;

  [key: `ds-title${number}`]: string;

  [key: `ds-text${number}`]: string;
}

export default function Einstellungen() {
  // form-hooks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormData>();

  const [value, loading, error] = useDocumentOnce(
    doc(db, "settings", "settings")
  );

  const [questions, setQuestions] = useState<Question[]>([]);
  const [datenschutz, setDatenschutz] = useState<Datenschutz[]>([]);

  useEffect(() => {
    setQuestions(value?.data()!.questions as Question[]);
    setDatenschutz(value?.data()!.datenschutzhinweis as Datenschutz[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function safeSettings(data) {
    const settings = {
      questions: [],
      datenschutzhinweis: [],
    };

    questions.forEach((question, i) => {
      settings.questions.push({
        question: data[`question${i + 1}`],
        example: data[`example${i + 1}`],
      });
    });

    datenschutz.forEach((question, i) => {
      settings.datenschutzhinweis.push({
        title: data[`ds-title${i + 1}`],
        text: data[`ds-text${i + 1}`],
      });
    });

    try {
      await setDoc(doc(db, "settings", "settings"), settings, { merge: true });
      toast.success("Einstellungen gespeichert", {
        position: "top-right",
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
      console.error(error);
    }
  }

  function addQuestion(e) {
    e.preventDefault();

    const newQuestion: Question = { question: "", example: "" };
    setQuestions((prev) => [...prev, newQuestion]);
  }

  function removeQuestion(index: number) {
    // setQuestions((prev) => [...prev.toSpliced(index, 1)]);
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function addHinweis(e) {
    e.preventDefault();

    const newHinweis: Datenschutz = { title: "", text: "" };
    setDatenschutz((prev) => [...prev, newHinweis]);
  }

  function removeHinweis(index: number) {
    // setDatenschutz((prev) => [...prev.toSpliced(index, 1)]);
    setDatenschutz((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      <h1>Einstellungen</h1>

      <Toolbar>
        <button
          form="settingsForm"
          onClick={safeSettings}
          disabled={loading}
          className=""
        >
          Speichern
        </button>
      </Toolbar>

      {error && <ErrorIndicator error={error} />}
      {loading && <LoadingSpinner>Lade Einstellungen...</LoadingSpinner>}

      {!loading && questions && datenschutz && (
        <form id="settingsForm" onSubmit={handleSubmit(safeSettings)}>
          <fieldset>
            <h3>Fragen</h3>
            <div className="flex flex-col lg:flex-row gap-2">
              {questions.map((question, i) => {
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
                        defaultValue={question.question}
                        {...(Object.hasOwn(errors, `question${i + 1}`)
                          ? {
                              "aria-invalid": Object.hasOwn(
                                errors,
                                `question${i + 1}`
                              ),
                            }
                          : {})}
                        aria-describedby={`valid-helper-question${i + 1}`}
                        {...register(`question${i + 1}`, {
                          required: {
                            value: true,
                            message: "Bitte eine Frage angeben.",
                          },
                        })}
                      />
                      {errors[`question${i + 1}`] && (
                        <small id={`valid-helper-question${i + 1}`}>
                          {errors[`question${i + 1}`]?.message! as string}
                        </small>
                      )}
                    </label>
                    <label>
                      Beispiel
                      <input
                        type="text"
                        defaultValue={question.example}
                        {...(Object.hasOwn(errors, `example${i + 1}`)
                          ? {
                              "aria-invalid": Object.hasOwn(
                                errors,
                                `example${i + 1}`
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
                          {errors[`example${i + 1}`]?.message! as string}
                        </small>
                      )}
                    </label>
                  </article>
                );
              })}
            </div>

            <button type="submit" className="secondary" onClick={addQuestion}>
              Neue Frage
            </button>

            <h3>Datenschutzhinweis</h3>
            <div className="flex flex-col lg:flex-row gap-2">
              {datenschutz.map((hinweis, i) => (
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
                      defaultValue={hinweis.title}
                      {...(Object.hasOwn(errors, `ds-title${i + 1}`)
                        ? {
                            "aria-invalid": Object.hasOwn(
                              errors,
                              `ds-title${i + 1}`
                            ),
                          }
                        : {})}
                      aria-describedby={`valid-helper-ds-title${i + 1}`}
                      {...register(`ds-title${i + 1}`, {
                        required: {
                          value: false,
                          message: `Bitte einen Titel für den Hinweis angeben.`,
                        },
                      })}
                    />
                    {errors[`ds-title${i + 1}`] && (
                      <small id={`valid-helper-ds-title${i + 1}`}>
                        {errors[`ds-title${i + 1}`]?.message! as string}
                      </small>
                    )}
                  </label>

                  <label>
                    Text
                    <textarea
                      defaultValue={hinweis.text}
                      {...(Object.hasOwn(errors, `ds-text${i + 1}`)
                        ? {
                            "aria-invalid": Object.hasOwn(
                              errors,
                              `ds-text${i + 1}`
                            ),
                          }
                        : {})}
                      aria-describedby={`valid-helper-ds-text${i + 1}`}
                      {...register(`ds-text${i + 1}`, {
                        required: {
                          value: false,
                          message: `Bitte eine Beschreibung für den Hinweis angeben.`,
                        },
                      })}
                    />
                    {errors[`ds-text${i + 1}`] && (
                      <small id={`valid-helper-ds-text${i + 1}`}>
                        {errors[`ds-text${i + 1}`]?.message! as string}
                      </small>
                    )}
                  </label>
                </article>
              ))}
            </div>

            <button type="submit" className="secondary" onClick={addHinweis}>
              Neuer Hinweis
            </button>
          </fieldset>
        </form>
      )}
    </>
  );
}
